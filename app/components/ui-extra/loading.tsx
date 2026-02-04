import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { Spinner } from "../ui/spinner";

export function Loading(props: { className?: ClassValue }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 px-4 py-8",
        props.className,
      )}
    >
      <Spinner className="size-8 text-primary" />
      <p className="text-sm">Loading...</p>
    </div>
  );
}
