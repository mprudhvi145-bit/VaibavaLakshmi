
import React from 'react';

interface HighlighterProps {
  text: string;
  highlight: string;
  className?: string;
}

const Highlighter: React.FC<HighlighterProps> = ({ text, highlight, className = '' }) => {
  if (!highlight || highlight.length < 2) {
    return <span className={className}>{text}</span>;
  }

  // Escape special regex chars
  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const terms = highlight.split(' ').map(t => escapeRegExp(t)).filter(t => t);
  
  // Create regex for all terms
  const regex = new RegExp(`(${terms.join('|')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <span key={i} className="bg-brand-gold/30 font-bold text-brand-primary rounded px-0.5">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
};

export default Highlighter;
