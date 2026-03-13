import React, { useState } from "react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export function MonthYearPicker({
  value,
  onChange,
  label,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  label: string;
}) {
  const [localMonth, setLocalMonth] = useState(value ? value.split("-")[1] : "");
  const [localYear, setLocalYear]   = useState(value ? value.split("-")[0] : "");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => String(currentYear - i));

  const update = (month: string, year: string) => {
    if (month && year) onChange(`${year}-${month}`);
    else onChange(null);
  };

  return (
    <div>
      {label && <p className="text-xs text-neutral-400 mb-1">{label}</p>}
      <div className="flex gap-2">
        <select
          value={localMonth}
          onChange={(e) => { setLocalMonth(e.target.value); update(e.target.value, localYear); }}
          className="flex-1 text-sm bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-neutral-500"
        >
          <option value="">Month</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>
          ))}
        </select>
        <select
          value={localYear}
          onChange={(e) => { setLocalYear(e.target.value); update(localMonth, e.target.value); }}
          className="flex-1 text-sm bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-neutral-500"
        >
          <option value="">Year</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  );
}
