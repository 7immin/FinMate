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
  /** 고지서에 적힌 발급 학교 이름. 못 읽었으면 빈 문자열. */
  institution: string;
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

export interface ProofCheckResult {
  /** 고른 종류의 서류로 보이는지. 위조 여부가 아니라 종류만 본다. */
  matches: boolean;
  /** 실제로 무슨 문서로 보이는지. 사용자에게 "이건 여권 사진입니다"처럼 알려 준다. */
  documentKind: string;
  /** 그렇게 본 이유 한 문장. 그대로 화면에 띄운다. */
  reason: string;
}

/**
 * 증빙 서류가 고른 종류와 맞는지 확인한다.
 *
 * 통과하지 못하면 요청을 막는다. 아무 파일이나 붙여서 한도를 요청할 수
 * 있으면, 담당자는 파일명만 보고 승인 여부를 정하게 된다.
 */
export function checkProofDocument(file: File, proofType: string): Promise<ProofCheckResult> {
  return callOcrRouteWithBody<ProofCheckResult>("/api/ocr/proof", file, { proofType });
}

async function callOcrRouteWithBody<T>(
  endpoint: string,
  file: File,
  extra: Record<string, unknown>
): Promise<T> {
  if (file.size > MAX_FILE_SIZE_BYTES) throw new OcrError("file_too_large");
  const { data, mimeType } = await fileToBase64(file);
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, mimeType, ...extra }),
  });
  if (!res.ok) throw new OcrError("request_failed");
  const json = await res.json();
  return json.result as T;
}
