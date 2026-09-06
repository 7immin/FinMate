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
