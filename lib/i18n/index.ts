import { Language } from "@/lib/types";
import { translations, sharedTranslations } from "./translations";

function getNode(root: unknown, path: string[]): unknown {
  return path.reduce<unknown>((node, key) => {
    if (node && typeof node === "object" && key in (node as Record<string, unknown>)) {
      return (node as Record<string, unknown>)[key];
    }
    return undefined;
  }, root);
}

export function translateNode<T = unknown>(lang: Language, key: string): T {
  const path = key.split(".");
  const node = getNode(translations[lang], path) ?? getNode(translations.ko, path);
  return node as T;
}

export function translate(
  lang: Language,
  key: string,
  vars?: Record<string, string | number>
): string {
  const node = translateNode<unknown>(lang, key);
  const text = typeof node === "string" ? node : key;
  if (!vars) return text;
  return Object.entries(vars).reduce(
    (acc, [varKey, value]) => acc.split(`{{${varKey}}}`).join(String(value)),
    text
  );
}

export function translateOptional(lang: Language, key: string): string | undefined {
  const node = translateNode<unknown>(lang, key);
  return typeof node === "string" ? node : undefined;
}

type SharedGroup = keyof typeof sharedTranslations.ko;

export function translateShared(lang: Language, group: SharedGroup, id: string): string {
  const groupNode = sharedTranslations[lang][group] as Record<string, string>;
  return groupNode?.[id] ?? id;
}

export const LANGUAGE_NATIVE_NAME: Record<Language, string> = {
  ko: "한국어",
  en: "English",
  zh: "中文",
  vi: "Tiếng Việt",
};
