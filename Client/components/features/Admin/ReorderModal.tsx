"use client";

import { Button, Modal, Space } from "antd";
import { useState } from "react";
import { LuArrowDown, LuArrowUp, LuChevronsDown, LuChevronsUp } from "react-icons/lu";

/**
 * Accessible reordering without drag-and-drop libraries: move items with
 * buttons (keyboard friendly), then save the full order in one request.
 */
export default function ReorderModal({
  open,
  title,
  items,
  onClose,
  onSave,
  saving,
}: {
  open: boolean;
  title: string;
  items: { id: string; label: string; meta?: string }[];
  onClose: () => void;
  onSave: (ids: string[]) => void;
  saving?: boolean;
}) {
  const [order, setOrder] = useState(items);
  // Start from the current order whenever the modal opens or the items change
  const [source, setSource] = useState({ items, open });
  if (source.items !== items || source.open !== open) {
    setSource({ items, open });
    setOrder(items);
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setOrder(next);
  };

  return (
    <Modal
      open={open}
      title={title}
      onCancel={onClose}
      onOk={() => onSave(order.map((item) => item.id))}
      okText="Save order"
      confirmLoading={saving}
      width={640}
    >
      <ol className="max-h-[60vh] space-y-1.5 overflow-y-auto pr-1">
        {order.map((item, index) => (
          <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-paper-50 px-3 py-2 ring-1 ring-paper-300/70">
            <span className="min-w-0">
              <span className="mr-2 font-mono text-xs text-stone-500">{index + 1}</span>
              <span className="font-medium">{item.label}</span>
              {item.meta && <span className="ml-2 text-xs text-stone-500">{item.meta}</span>}
            </span>
            <Space.Compact>
              <Button size="small" aria-label="Move to top" icon={<LuChevronsUp aria-hidden />} disabled={index === 0} onClick={() => move(index, 0)} />
              <Button size="small" aria-label="Move up" icon={<LuArrowUp aria-hidden />} disabled={index === 0} onClick={() => move(index, index - 1)} />
              <Button size="small" aria-label="Move down" icon={<LuArrowDown aria-hidden />} disabled={index === order.length - 1} onClick={() => move(index, index + 1)} />
              <Button size="small" aria-label="Move to bottom" icon={<LuChevronsDown aria-hidden />} disabled={index === order.length - 1} onClick={() => move(index, order.length - 1)} />
            </Space.Compact>
          </li>
        ))}
      </ol>
    </Modal>
  );
}
