import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Plain clsx only concatenates class names -- when a component's own
// classes and a caller's override className both set the same CSS property
// (e.g. Button's default w-full vs. a caller's w-auto), which one visually
// wins depends on Tailwind's internal ordering in the compiled stylesheet,
// not on the order the classes were written. That ordering isn't guaranteed
// to match between `next dev`'s incremental build and a production build,
// so the same code could render correctly in dev and wrong once deployed.
// twMerge resolves same-property conflicts deterministically by keeping the
// last one specified, matching what every caller actually expects.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
