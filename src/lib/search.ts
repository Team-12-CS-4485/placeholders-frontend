import React from 'react';

export type SearchTarget =
  | { type: 'week'; weekId: string }
  | { type: 'narrative'; weekId: string; narrativeId: string }
  | { type: 'trend'; trendId: string }
  | { type: 'video'; videoId: string };

export interface SearchDocument {
  id: string;
  kind: 'week' | 'narrative' | 'trend' | 'video' | 'claim';
  title: string;
  subtitle: string;
  body: string;
  keywords?: string[];
  target: SearchTarget;
}

export interface SearchMatch extends SearchDocument {
  score: number;
  snippet: string;
}

export function reactNodeToText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) {
    return node.map(child => reactNodeToText(child)).filter(Boolean).join(' ');
  }
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return reactNodeToText(node.props.children);
  }
  return '';
}

export function normalizeSearchText(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function splitTerms(query: string): string[] {
  return Array.from(
    new Set(
      normalizeSearchText(query)
        .split(' ')
        .map(term => term.trim())
        .filter(Boolean),
    ),
  );
}

function countTermHits(haystack: string, term: string): number {
  if (!haystack || !term) return 0;

  let hits = 0;
  let index = haystack.indexOf(term);

  while (index !== -1) {
    hits += 1;
    index = haystack.indexOf(term, index + term.length);
  }

  return hits;
}

function trimToWordBoundary(text: string, index: number, direction: 'start' | 'end'): number {
  let nextIndex = index;

  if (direction === 'start') {
    while (nextIndex > 0 && text[nextIndex] !== ' ') nextIndex -= 1;
    return nextIndex === 0 ? 0 : nextIndex + 1;
  }

  while (nextIndex < text.length && text[nextIndex] !== ' ') nextIndex += 1;
  return nextIndex;
}

function createSnippet(source: string, query: string, terms: string[]): string {
  const compact = source.replace(/\s+/g, ' ').trim();
  if (!compact) return '';

  const normalizedSource = normalizeSearchText(compact);
  const normalizedQuery = normalizeSearchText(query);

  let matchIndex = normalizedSource.indexOf(normalizedQuery);
  if (matchIndex === -1) {
    for (const term of terms) {
      matchIndex = normalizedSource.indexOf(term);
      if (matchIndex !== -1) break;
    }
  }

  if (matchIndex === -1) {
    return compact.length > 140 ? `${compact.slice(0, 137).trimEnd()}...` : compact;
  }

  const visualIndex = compact.toLowerCase().indexOf(query.toLowerCase());
  const fallbackIndex = terms
    .map(term => compact.toLowerCase().indexOf(term.toLowerCase()))
    .find(index => index >= 0);
  const sourceIndex = visualIndex >= 0 ? visualIndex : fallbackIndex ?? 0;

  const start = trimToWordBoundary(compact, Math.max(0, sourceIndex - 70), 'start');
  const end = trimToWordBoundary(
    compact,
    Math.min(compact.length, sourceIndex + Math.max(query.length, 80)),
    'end',
  );

  const prefix = start > 0 ? '... ' : '';
  const suffix = end < compact.length ? ' ...' : '';
  return `${prefix}${compact.slice(start, end).trim()}${suffix}`;
}

export function searchDocuments(
  documents: SearchDocument[],
  query: string,
  limit = 12,
): SearchMatch[] {
  const terms = splitTerms(query);
  if (terms.length === 0) return [];

  const normalizedQuery = normalizeSearchText(query);

  return documents
    .flatMap(document => {
      const title = normalizeSearchText(document.title);
      const subtitle = normalizeSearchText(document.subtitle);
      const body = normalizeSearchText(document.body);
      const keywords = normalizeSearchText((document.keywords ?? []).join(' '));
      const combined = [title, subtitle, keywords, body].filter(Boolean).join(' ');

      if (!terms.every(term => combined.includes(term))) return [];

      let score = 0;

      if (title === normalizedQuery) score += 220;
      if (title.startsWith(normalizedQuery)) score += 150;
      if (title.includes(normalizedQuery)) score += 120;
      if (subtitle.includes(normalizedQuery)) score += 70;
      if (keywords.includes(normalizedQuery)) score += 65;
      if (body.includes(normalizedQuery)) score += 45;

      for (const term of terms) {
        if (title.includes(term)) score += 28;
        if (subtitle.includes(term)) score += 14;
        if (keywords.includes(term)) score += 18;
        score += Math.min(countTermHits(body, term), 8) * 6;
      }

      return [
        {
          ...document,
          score,
          snippet: createSnippet(document.body || document.subtitle || document.title, query, terms),
        },
      ];
    })
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
    .slice(0, limit);
}
