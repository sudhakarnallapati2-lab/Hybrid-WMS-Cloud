import * as React from "react";
import { clsx } from "clsx";

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={clsx("inline-flex items-center justify-center rounded-2xl px-3 py-2 text-sm font-medium bg-black text-white hover:opacity-90 disabled:opacity-50", className)} {...props} />;
}
