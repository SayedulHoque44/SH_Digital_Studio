"use client";
import { ReactNode } from "react";
import { ExternalToast, toast } from "sonner";

type ToastMsgProps = string | ReactNode;
type ToastOptionsProps = ExternalToast;

export const successToast = (
  msg: ToastMsgProps,
  options?: ToastOptionsProps
) => {
  return toast.success(msg, options);
};
type ErrorToastArgs =
  | string
  | {
      msg?: any;
      error?: any;
      options?: ToastOptionsProps;
    };

export const errorToast = (args: ErrorToastArgs) => {
  // If called like errorToast("a message")
  if (typeof args === "string") {
    return toast.error(args);
  }

  // If called like errorToast({ msg, error, options })
  const { msg, error, options } = args || {};

  if (error) {
    return toast.error(
      error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Something went wrong",
      options
    );
  }
  return toast.error(msg, options);
};

export const infoToast = (msg: ToastMsgProps, options?: ToastOptionsProps) => {
  return toast.info(msg, options);
};
