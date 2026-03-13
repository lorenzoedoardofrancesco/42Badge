import React from "react";

export function renderMd(text: string, codeClassName?: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code
          key={i}
          className={codeClassName}
          style={!codeClassName ? { fontFamily: "monospace", fontSize: "0.9em" } : undefined}
        >
          {part.slice(1, -1)}
        </code>
      );
    return part;
  });
}
