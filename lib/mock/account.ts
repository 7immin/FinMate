import { DocumentFlags } from "@/lib/types";

export const BRANCH_DISTANCES = ["340m", "1.1km", "1.6km"] as const;

export type GuidanceVariant = "noReg" | "hasReg";

export function resolveGuidanceVariant(documents: DocumentFlags): GuidanceVariant {
  return documents.hasAlienRegistration === "yes" ? "hasReg" : "noReg";
}
