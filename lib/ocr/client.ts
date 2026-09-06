import { FinancialPassport } from "@/lib/types";

export const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

export function fileToBase64(file: File): Promise<{ data: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.slice(result.indexOf(",") + 1);
      resolve({ data: base64, mimeType: file.type || "image/jpeg" });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export class OcrError extends Error {}

async function callOcrRoute<T>(endpoint: string, file: File): Promise<T> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new OcrError("file_too_large");
  }
  const { data, mimeType } = await fileToBase64(file);
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, mimeType }),
  });
  if (!res.ok) throw new OcrError("request_failed");
  const json = await res.json();
  return json.result as T;
}

export interface TuitionOcrResult {
  title: string;
  amount: number;
  dueDate: string;
  virtualAccount: string;
}

export interface DepositOcrResult {
  address: string;
  deposit: number;
  rent: number;
  rentDay: string;
  period: string;
}

export function readTuitionInvoice(file: File) {
  return callOcrRoute<TuitionOcrResult>("/api/ocr/tuition", file);
}

export function readLeaseContract(file: File) {
  return callOcrRoute<DepositOcrResult>("/api/ocr/deposit", file);
}

export interface VerifyChecklistResult {
  ok: boolean;
  result: Record<string, unknown>;
  passport?: FinancialPassport;
}

/**
 * Uploads a proof document (passport copy, bankbook, payment receipt) for a
 * given passport checklist item. `ok: false` means Gemini genuinely couldn't
 * read anything useful from it -- not a network/API failure, which throws
 * instead -- so the caller can show a "try again" state either way.
 */
export async function verifyChecklistDocument(
  itemId: string,
  file: File
): Promise<VerifyChecklistResult> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new OcrError("file_too_large");
  }
  const { data, mimeType } = await fileToBase64(file);
  const res = await fetch("/api/passport/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId, data, mimeType }),
  });
  if (!res.ok) throw new OcrError("request_failed");
  return (await res.json()) as VerifyChecklistResult;
}
