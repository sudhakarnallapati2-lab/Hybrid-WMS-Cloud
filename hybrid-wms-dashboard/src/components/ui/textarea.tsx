import * as React from "react";
import { clsx } from "clsx";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx("w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 min-h-[120px] dark:bg-neutral-900 dark:border-neutral-800", className)} {...props} />;
}
