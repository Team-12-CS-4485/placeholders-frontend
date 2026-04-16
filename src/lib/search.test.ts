import React from 'react';
import { describe, expect, it } from 'vitest';
import {
  normalizeSearchText,
  reactNodeToText,
  searchDocuments,
  type SearchDocument,
} from './search';

describe('reactNodeToText', () => {
  it('flattens nested React content into searchable text', () => {
    const node = React.createElement(
      React.Fragment,
      null,
      'Top line ',
      React.createElement('strong', null, 'with emphasis'),
      React.createElement('span', null, ' and a tail.'),
    );

    expect(reactNodeToText(node)).toContain('Top line');
    expect(reactNodeToText(node)).toContain('with emphasis');
    expect(reactNodeToText(node)).toContain('and a tail.');
  });
});

describe('normalizeSearchText', () => {
  it('removes punctuation and normalizes casing', () => {
    expect(normalizeSearchText('Breaking: UFO?! Case-File')).toBe('breaking ufo case file');
  });
});

describe('searchDocuments', () => {
  const documents: SearchDocument[] = [
    {
      id: 'trend-1',
      kind: 'trend',
      title: 'UFO Surveillance Surge',
      subtitle: 'Trend Analytics',
      body: 'Audience interest spiked after a week of testimony clips.',
      target: { type: 'trend', trendId: '1' },
    },
    {
      id: 'narrative-7',
      kind: 'narrative',
      title: 'Witness videos fuel the UFO hearing backlash',
      subtitle: 'Week 7',
      body: 'Transcripts and article copy both mention witness testimony in detail.',
      target: { type: 'narrative', weekId: 'week7', narrativeId: '7' },
    },
  ];

  it('returns the most relevant matches first', () => {
    const [first] = searchDocuments(documents, 'witness testimony');
    expect(first?.id).toBe('narrative-7');
  });

  it('creates a snippet around the matching text', () => {
    const [first] = searchDocuments(documents, 'week of testimony');
    expect(first?.snippet).toContain('testimony');
  });
});
