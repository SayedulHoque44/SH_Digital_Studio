"use client";

import { Popconfirm } from "antd";
import React from "react";

// Every delete/remove button in the admin asks "Yes / No" first.
export default function ConfirmDelete({
  title = "Delete this?",
  description,
  onConfirm,
  children,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  onConfirm: () => void;
  children: React.ReactElement;
}) {
  return (
    <Popconfirm title={title} description={description} okText="Yes, delete" cancelText="No" okButtonProps={{ danger: true }} onConfirm={onConfirm}>
      {children}
    </Popconfirm>
  );
}
