import React, { useState, useRef } from "react";

export function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && input === "" && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div
      className="flex flex-wrap gap-1.5 min-h-[34px] w-full bg-neutral-900 border border-neutral-600 rounded px-2 py-1.5 cursor-text focus-within:border-neutral-500"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-700 text-neutral-200 text-xs">
          {tag}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(tags.filter((t) => t !== tag)); }}
            className="text-neutral-500 hover:text-neutral-200 leading-none"
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={commit}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[80px] bg-transparent text-xs text-neutral-200 outline-none placeholder:text-neutral-600"
      />
    </div>
  );
}
