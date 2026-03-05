import React from "react";

// Format text with basic markdown-like features: newlines and bullet points
export function formatText(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let paragraphLines: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      elements.push(
        <p key={`p-${elements.length}`} className="mb-3 last:mb-0">
          {paragraphLines.join(' ')}
        </p>
      );
      paragraphLines = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <div key={`list-${elements.length}`} className="mb-3 space-y-1.5">
          {listItems.map((item, i) => (
            <p key={i}>{item}</p>
          ))}
        </div>
      );
      listItems = [];
    }
  };

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    // Horizontal rule (--- or lines of mostly dashes)
    if (/^-{3,}$/.test(trimmedLine.replace(/[^-]/g, '')) && trimmedLine.replace(/[^-]/g, '').length >= 3) {
      flushList();
      flushParagraph();
      // Extract label text between dashes if present (e.g., "--- Label ---")
      const labelMatch = trimmedLine.match(/^-{3,}\s+(.+?)\s+-{3,}$/);
      if (labelMatch && labelMatch[1]) {
        elements.push(
          <div key={`hr-${elements.length}`} className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-current opacity-20" />
            <span className="text-sm opacity-60 font-semibold uppercase tracking-wider">{labelMatch[1]}</span>
            <div className="flex-1 h-px bg-current opacity-20" />
          </div>
        );
      } else {
        elements.push(
          <hr key={`hr-${elements.length}`} className="my-4 border-current opacity-20" />
        );
      }
    }
    // Check if line is a list item (- or *)
    else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      flushParagraph();
      listItems.push(trimmedLine.substring(2));
    }
    // Empty line - paragraph break
    else if (trimmedLine === '') {
      flushList();
      flushParagraph();
    }
    // Regular text line
    else {
      flushList();
      paragraphLines.push(trimmedLine);
    }
  });

  // Flush any remaining content
  flushList();
  flushParagraph();

  return <>{elements}</>;
}
