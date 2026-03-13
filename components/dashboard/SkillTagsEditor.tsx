import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SKILL_PALETTE } from "../../lib/skillPalette";
import { TagInput } from "./TagInput";

export type SkillTagItem = { category: string; items: string[] };

function SortableSkillRow({
  id,
  tag,
  index,
  editing,
  formJsx,
  onEdit,
  onRemove,
}: {
  id: string;
  tag: SkillTagItem;
  index: number;
  editing: boolean;
  formJsx: React.ReactNode;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const c = SKILL_PALETTE[index % SKILL_PALETTE.length];

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="flex items-start gap-2 px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-md"
    >
      {editing ? (
        <div className="flex-1">{formJsx}</div>
      ) : (
        <>
          <button
            {...attributes}
            {...listeners}
            className="shrink-0 mt-0.5 text-neutral-600 hover:text-neutral-400 cursor-grab active:cursor-grabbing touch-none"
            aria-label="Drag to reorder"
          >
            <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
              <circle cx="4" cy="3" r="1.5"/><circle cx="8" cy="3" r="1.5"/>
              <circle cx="4" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/>
              <circle cx="4" cy="13" r="1.5"/><circle cx="8" cy="13" r="1.5"/>
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: c.text }}>{tag.category}</div>
            <div className="flex flex-wrap gap-1.5">
              {tag.items.map((item) => (
                <span key={item} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border" style={{ backgroundColor: c.bg, borderColor: c.border, color: c.text }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
          <button onClick={onEdit} className="text-xs text-neutral-500 hover:text-neutral-300 shrink-0 transition-colors">Edit</button>
          <button onClick={onRemove} className="text-xs text-neutral-600 hover:text-red-400 shrink-0 transition-colors">Delete</button>
        </>
      )}
    </div>
  );
}

export function SkillTagsEditor({
  value,
  onChange,
}: {
  value: SkillTagItem[];
  onChange: (next: SkillTagItem[]) => void;
}) {
  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [formCategory, setFormCategory] = useState("");
  const [formItems, setFormItems] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const openAdd = () => {
    setEditing(null);
    setFormCategory("");
    setFormItems([]);
    setAdding(true);
  };

  const openEdit = (i: number) => {
    setAdding(false);
    setFormCategory(value[i].category);
    setFormItems(value[i].items);
    setEditing(i);
  };

  const cancelForm = () => {
    setAdding(false);
    setEditing(null);
    setFormCategory("");
    setFormItems([]);
  };

  const saveForm = () => {
    if (!formCategory.trim()) return;
    const entry = { category: formCategory.trim(), items: formItems };
    const next = editing !== null
      ? value.map((t, i) => i === editing ? entry : t)
      : [...value, entry];
    onChange(next);
    cancelForm();
  };

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = value.findIndex((t) => t.category === active.id);
      const newIndex = value.findIndex((t) => t.category === over.id);
      onChange(arrayMove(value, oldIndex, newIndex));
    }
  };

  const formJsx = (
    <div className="space-y-2">
      <input
        type="text"
        value={formCategory}
        onChange={(e) => setFormCategory(e.target.value)}
        placeholder="Category (e.g. Languages)"
        className="w-full text-xs bg-neutral-900 border border-neutral-600 text-neutral-200 rounded px-2 py-1 focus:outline-none focus:border-neutral-500 placeholder:text-neutral-600"
        onKeyDown={(e) => e.key === "Enter" && saveForm()}
      />
      <TagInput tags={formItems} onChange={setFormItems} placeholder="Add tags (Enter or comma to confirm)" />
      <div className="flex gap-2">
        <button onClick={saveForm} className="px-3 py-1 text-xs rounded-md bg-neutral-700 hover:bg-neutral-600 text-white border border-neutral-600 transition-colors">Save</button>
        <button onClick={cancelForm} className="px-3 py-1 text-xs rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-400 border border-neutral-700 transition-colors">Cancel</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={value.map((t) => t.category)} strategy={verticalListSortingStrategy}>
          {value.map((tag, i) => (
            <SortableSkillRow
              key={tag.category}
              id={tag.category}
              tag={tag}
              index={i}
              editing={editing === i}
              formJsx={formJsx}
              onEdit={() => openEdit(i)}
              onRemove={() => remove(i)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {adding ? (
        <div className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md">{formJsx}</div>
      ) : (
        <button onClick={openAdd} className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
          + Add category
        </button>
      )}
    </div>
  );
}
