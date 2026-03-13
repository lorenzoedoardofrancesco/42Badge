import React from "react";

export function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-3">
      <span className="text-sm text-neutral-400 w-28 shrink-0">{label}</span>
      <select
        className="flex-1 text-sm bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-md px-3 py-1.5 appearance-none focus:outline-none focus:border-neutral-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </label>
  );
}
