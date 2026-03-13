import React, { useState } from "react";
import { EMPLOYMENT_TYPES } from "../../lib/workExperiences";
import { renderMd } from "../common/RenderMd";
import { MonthYearPicker } from "./MonthYearPicker";

export type ExpFormState = {
  type: "FORTY_TWO" | "EXTERNAL";
  projectSlug: string;
  jobTitle: string;
  employmentType: string;
  companyName: string;
  companyCity: string;
  companyCountry: string;
  startDate: string | null;
  endDate: string | null;
  description: string;
};

export function ExpForm({
  form,
  setForm,
  validatedWork42,
  onSave,
  onCancel,
}: {
  form: ExpFormState;
  setForm: React.Dispatch<React.SetStateAction<ExpFormState>>;
  validatedWork42: any[];
  onSave: () => void;
  onCancel: () => void;
}) {
  const set = (key: keyof ExpFormState, val: any) => setForm((f) => ({ ...f, [key]: val }));
  const [isPresent, setIsPresent] = useState(form.endDate === null);
  const [descPreview, setDescPreview] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <p className="text-xs text-neutral-400 shrink-0">Type</p>
        <div className="flex rounded-md border border-neutral-700 overflow-hidden">
          {(["EXTERNAL", "FORTY_TWO"] as const).map((t) => (
            <button key={t} onClick={() => set("type", t)}
              className={`px-3 py-1 text-xs font-medium transition-colors ${form.type === t ? "bg-neutral-600 text-white" : "bg-neutral-800 text-neutral-400 hover:text-neutral-200"}`}
            >
              {t === "FORTY_TWO" ? "42-validated" : "External"}
            </button>
          ))}
        </div>
      </div>

      {form.type === "FORTY_TWO" && (
        <div>
          <p className="text-xs text-neutral-400 mb-1">Linked 42 Project</p>
          <select value={form.projectSlug} onChange={(e) => set("projectSlug", e.target.value)}
            className="w-full text-sm bg-neutral-900 border border-neutral-700 text-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-neutral-500"
          >
            <option value="">Select a validated work experience</option>
            {validatedWork42.map((p: any) => (
              <option key={p.id} value={p.project.slug}>{p.project.name} ({p.final_mark ?? "?"})</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <p className="text-xs text-neutral-400 mb-1">Company <span className="text-red-500">*</span></p>
          <input type="text" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Acme Corp"
            className="w-full text-sm bg-neutral-900 border border-neutral-700 text-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-neutral-500 placeholder:text-neutral-600" />
        </div>
        <div>
          <p className="text-xs text-neutral-400 mb-1">City</p>
          <input type="text" value={form.companyCity} onChange={(e) => set("companyCity", e.target.value)} placeholder="Paris"
            className="w-full text-sm bg-neutral-900 border border-neutral-700 text-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-neutral-500 placeholder:text-neutral-600" />
        </div>
        <div>
          <p className="text-xs text-neutral-400 mb-1">Country</p>
          <input type="text" value={form.companyCountry} onChange={(e) => set("companyCountry", e.target.value)} placeholder="France"
            className="w-full text-sm bg-neutral-900 border border-neutral-700 text-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-neutral-500 placeholder:text-neutral-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-neutral-400 mb-1">Job Title</p>
          <input type="text" value={form.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} placeholder="e.g. Backend Engineer"
            className="w-full text-sm bg-neutral-900 border border-neutral-700 text-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-neutral-500 placeholder:text-neutral-600" />
        </div>
        <div>
          <p className="text-xs text-neutral-400 mb-1">Employment Type</p>
          <select value={form.employmentType} onChange={(e) => set("employmentType", e.target.value)}
            className="w-full text-sm bg-neutral-900 border border-neutral-700 text-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-neutral-500">
            {EMPLOYMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <MonthYearPicker label="Start Date *" value={form.startDate} onChange={(v) => set("startDate", v)} />
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-neutral-400">End Date</p>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isPresent}
                onChange={(e) => {
                  setIsPresent(e.target.checked);
                  if (e.target.checked) set("endDate", null);
                }}
                className="accent-green-500 w-3 h-3"
              />
              <span className="text-xs text-neutral-400">Present</span>
            </label>
          </div>
          {isPresent ? (
            <div className="flex items-center h-[34px] px-2 rounded-md border border-neutral-700 bg-neutral-900/50">
              <span className="text-xs text-neutral-500">Current position</span>
            </div>
          ) : (
            <MonthYearPicker label="" value={form.endDate} onChange={(v) => set("endDate", v)} />
          )}
        </div>
      </div>

      <div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-1">
          <p className="text-xs text-neutral-400">Description <span className="text-red-500">*</span></p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-600">Markdown: **bold**, *italic*, `code`</span>
            <button onClick={() => setDescPreview((v) => !v)}
              className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${descPreview ? "border-green-700 text-green-400 bg-green-950/30" : "border-neutral-700 text-neutral-500 hover:text-neutral-300"}`}
            >
              {descPreview ? "Edit" : "Preview"}
            </button>
          </div>
        </div>
        {descPreview ? (
          <div className="min-h-[120px] w-full text-sm bg-neutral-900 border border-neutral-700 text-neutral-200 rounded-md px-3 py-2 space-y-1.5">
            {form.description.split("\n").filter(Boolean).map((line, i) => (
              <p key={i} className="text-sm leading-relaxed text-neutral-300">{renderMd(line, "px-1 py-0.5 rounded text-[11px] bg-neutral-700 text-neutral-200")}</p>
            ))}
            {!form.description && <p className="text-neutral-600 text-sm">Nothing to preview yet.</p>}
          </div>
        ) : (
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={6}
            placeholder="• Designed and implemented... &#10;• Led the migration of... &#10;• Technologies: C++20, CMake, Git"
            className="w-full text-sm bg-neutral-900 border border-neutral-700 text-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-neutral-500 placeholder:text-neutral-600 resize-y"
          />
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={onSave} className="px-4 py-1.5 text-xs rounded-md bg-green-700 hover:bg-green-600 text-white border border-green-600 transition-colors font-medium">Save</button>
        <button onClick={onCancel} className="px-4 py-1.5 text-xs rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-400 border border-neutral-700 transition-colors">Cancel</button>
      </div>
    </div>
  );
}
