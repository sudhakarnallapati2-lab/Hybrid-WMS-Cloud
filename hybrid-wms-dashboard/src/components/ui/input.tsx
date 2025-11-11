import * as React from "react";
import { clsx } from "clsx";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx("w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 dark:bg-neutral-900 dark:border-neutral-800", className)} {...props} />;
}
