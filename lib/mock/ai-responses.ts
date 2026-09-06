import { GraduationCap, Briefcase, HandCoins, Send, Landmark, LucideIcon } from "lucide-react";

export type AiAnswerKind = "tuitionShortage" | "remittanceProof" | "generic";

export const AI_ANSWER_CONFIG: Record<AiAnswerKind, { icons: LucideIcon[]; ctaHref: string }> = {
  tuitionShortage: { icons: [GraduationCap, Briefcase, HandCoins], ctaHref: "/tuition" },
  remittanceProof: { icons: [Briefcase, Landmark, GraduationCap], ctaHref: "/remittance" },
  generic: { icons: [Send], ctaHref: "/home" },
};

const KEYWORDS: Record<Exclude<AiAnswerKind, "generic">, string[]> = {
  tuitionShortage: ["학비", "등록금", "돈이 부족", "tuition", "学费", "học phí", "thiếu tiền"],
  remittanceProof: ["해외송금", "한도를 열려면", "뭘 내야", "remittance", "汇款", "chuyển tiền", "hạn mức"],
};

export function resolveAiAnswerKind(question: string): AiAnswerKind {
  const q = question.toLowerCase();
  if (KEYWORDS.tuitionShortage.some((k) => q.includes(k.toLowerCase()))) return "tuitionShortage";
  if (KEYWORDS.remittanceProof.some((k) => q.includes(k.toLowerCase()))) return "remittanceProof";
  return "generic";
}
