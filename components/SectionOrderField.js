"use client";

// Lets a customer drag portfolio sections into whatever order they want.
// Only the sections in SECTION_DEFINITIONS are ever passed in here — Intro
// and the closing Contact CTA are anchored first/last by every template and
// never appear in this list, so there's nothing to drag them into a broken
// position.
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SECTION_DEFINITIONS } from "@/lib/portfolioData";

const LABELS = Object.fromEntries(SECTION_DEFINITIONS.map((s) => [s.id, s.label]));

function GripIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <circle cx="6" cy="5" r="1.4" />
      <circle cx="14" cy="5" r="1.4" />
      <circle cx="6" cy="10" r="1.4" />
      <circle cx="14" cy="10" r="1.4" />
      <circle cx="6" cy="15" r="1.4" />
      <circle cx="14" cy="15" r="1.4" />
    </svg>
  );
}

function SortableRow({ id }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: "#ffffff",
    borderColor: isDragging ? "var(--home-strong)" : "rgba(20, 54, 93, 0.55)",
    color: "var(--home-strong)",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
        isDragging ? "z-10 shadow-md" : "shadow-sm"
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="ed-focus flex h-6 w-6 shrink-0 cursor-grab items-center justify-center rounded opacity-55 transition-opacity hover:opacity-100 active:cursor-grabbing"
        aria-label={`Drag to reorder ${LABELS[id]}`}
      >
        <GripIcon className="h-4 w-4" />
      </button>
      {LABELS[id]}
    </div>
  );
}

export default function SectionOrderField({ order, onChange }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(active.id);
    const newIndex = order.indexOf(over.id);
    onChange(arrayMove(order, oldIndex, newIndex));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {order.map((id) => (
            <SortableRow key={id} id={id} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
