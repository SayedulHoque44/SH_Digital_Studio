import React from "react";

// Consistent heading block for admin pages.
export default function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <div className="mb-2 text-sm text-stone-600">{eyebrow}</div>}
        <h1 className="font-display text-[1.9rem] font-semibold leading-tight tracking-[-0.03em] text-ink-950">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[0.95rem] text-stone-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
