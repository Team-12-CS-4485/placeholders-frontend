import React from 'react';

/**
 * Minimal markdown → React renderer for LLM-generated article bodies.
 * Handles: headings (#, ##, ###), **bold**, *italic*, - lists, numbered lists,
 * blockquotes (>), horizontal rules (---), and paragraph breaks.
 *
 * No external dependencies required.
 */

type Token =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'blockquote'; text: string }
  | { type: 'hr' };

function parseInline(text: string): React.ReactNode {
  // Process **bold**, *italic*, and plain text inline
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*/s);
    const italicMatch = remaining.match(/^(.*?)\*(.+?)\*/s);

    const boldIdx = boldMatch ? boldMatch[1].length : Infinity;
    const italicIdx = italicMatch ? italicMatch[1].length : Infinity;

    if (boldMatch && boldIdx <= italicIdx) {
      if (boldMatch[1]) parts.push(boldMatch[1]);
      parts.push(<strong key={key++}>{parseInline(boldMatch[2])}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
    } else if (italicMatch && italicIdx < boldIdx) {
      if (italicMatch[1]) parts.push(italicMatch[1]);
      parts.push(<em key={key++}>{parseInline(italicMatch[2])}</em>);
      remaining = remaining.slice(italicMatch[0].length);
    } else {
      parts.push(remaining);
      remaining = '';
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

function tokenize(markdown: string): Token[] {
  // Normalize line endings
  const normalised = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const tokens: Token[] = [];
  // Split into blocks on blank lines
  const blocks = normalised.split(/\n{2,}/).map(b => b.trim()).filter(Boolean);

  for (const block of blocks) {
    // Heading
    const headingMatch = block.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      tokens.push({
        type: 'heading',
        level: headingMatch[1].length as 1 | 2 | 3,
        text: headingMatch[2].trim(),
      });
      continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(block)) {
      tokens.push({ type: 'hr' });
      continue;
    }

    // Blockquote
    if (block.startsWith('>')) {
      tokens.push({
        type: 'blockquote',
        text: block.replace(/^>\s?/gm, '').trim(),
      });
      continue;
    }

    // Unordered list
    const ulLines = block.split('\n').filter(l => /^[-*+]\s/.test(l.trim()));
    if (ulLines.length > 0 && ulLines.length === block.split('\n').length) {
      tokens.push({
        type: 'list',
        ordered: false,
        items: ulLines.map(l => l.replace(/^[-*+]\s+/, '')),
      });
      continue;
    }

    // Ordered list
    const olLines = block.split('\n').filter(l => /^\d+\.\s/.test(l.trim()));
    if (olLines.length > 0 && olLines.length === block.split('\n').length) {
      tokens.push({
        type: 'list',
        ordered: true,
        items: olLines.map(l => l.replace(/^\d+\.\s+/, '')),
      });
      continue;
    }

    // Paragraph (join single newlines with a space)
    tokens.push({
      type: 'paragraph',
      text: block.replace(/\n/g, ' '),
    });
  }

  return tokens;
}

interface MarkdownBodyProps {
  markdown: string;
}

export const MarkdownBody: React.FC<MarkdownBodyProps> = ({ markdown }) => {
  const tokens = tokenize(markdown);

  return (
    <>
      {tokens.map((token, i) => {
        switch (token.type) {
          case 'heading': {
            const sizes: Record<number, string> = { 1: '2rem', 2: '1.6rem', 3: '1.3rem' };
            return (
              <h3
                key={i}
                style={{
                  fontSize: sizes[token.level],
                  marginTop: '28px',
                  marginBottom: '10px',
                  fontFamily: "'Playfair Display', serif",
                  borderBottom: token.level === 1 ? '1px solid var(--ink-heavy)' : 'none',
                  paddingBottom: token.level === 1 ? '6px' : '0',
                }}
              >
                {parseInline(token.text)}
              </h3>
            );
          }
          case 'paragraph':
            return (
              <p key={i} style={{ marginBottom: '15px', textIndent: '20px' }}>
                {parseInline(token.text)}
              </p>
            );
          case 'list': {
            const ListTag = token.ordered ? 'ol' : 'ul';
            return (
              <ListTag
                key={i}
                style={{
                  marginLeft: '28px',
                  marginBottom: '15px',
                  lineHeight: '1.7',
                }}
              >
                {token.items.map((item, j) => (
                  <li key={j}>{parseInline(item)}</li>
                ))}
              </ListTag>
            );
          }
          case 'blockquote':
            return (
              <blockquote
                key={i}
                style={{
                  borderLeft: '3px solid var(--ink-heavy)',
                  paddingLeft: '16px',
                  marginLeft: '0',
                  marginBottom: '15px',
                  fontStyle: 'italic',
                  color: 'var(--ink-faded)',
                }}
              >
                {parseInline(token.text)}
              </blockquote>
            );
          case 'hr':
            return (
              <hr
                key={i}
                style={{
                  border: 'none',
                  borderTop: '1px solid var(--ink-heavy)',
                  margin: '24px 0',
                }}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
};
