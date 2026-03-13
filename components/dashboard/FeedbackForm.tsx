import { useState } from "react";
import { GitHubIcon } from "../common/Icons";

const FEEDBACK_TYPES = [
  { value: "bug", label: "🐛 Bug report" },
  { value: "feature", label: "✨ Feature request" },
  { value: "other", label: "💬 Other" },
] as const;

export function FeedbackForm({ login }: { login: string }) {
  const [type, setType] = useState<string>("feature");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const submit = () => {
    if (!title.trim()) return;
    const labelMap: Record<string, string> = { bug: "bug", feature: "enhancement", other: "question" };
    const issueTitle = encodeURIComponent(`[${type}] ${title.trim()}`);
    const issueBody = encodeURIComponent(`**Submitted by:** @${login}\n\n${body.trim()}`);
    const label = labelMap[type] ?? "question";
    window.open(
      `https://github.com/lorenzoedoardofrancesco/42cv/issues/new?title=${issueTitle}&body=${issueBody}&labels=${label}`,
      "_blank"
    );
  };

  return (
    <div className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg space-y-3">
      <div className="flex gap-2">
        {FEEDBACK_TYPES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setType(value)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              type === value
                ? "bg-neutral-700 border-neutral-500 text-white"
                : "bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-neutral-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <input
        type="text"
        placeholder="Short title…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-sm bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-md px-3 py-2 focus:outline-none focus:border-neutral-500 placeholder:text-neutral-600"
      />
      <textarea
        placeholder="Tell us more (optional)…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        className="w-full text-sm bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-md px-3 py-2 focus:outline-none focus:border-neutral-500 placeholder:text-neutral-600 resize-none"
      />
      <button
        onClick={submit}
        disabled={!title.trim()}
        className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium bg-neutral-700 hover:bg-neutral-600 text-white border border-neutral-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <GitHubIcon size={14} />
        Open GitHub issue
      </button>
    </div>
  );
}
