import fs from "node:fs";
import path from "node:path";
import { SchoolId } from "@/lib/types";
import { extractMainText } from "./extract-text";
import { RawDoc, SchoolAdapter, SourceKind } from "./types";

const SNAPSHOT_DIR = path.join(process.cwd(), "lib/crawler/snapshots");
const FETCH_TIMEOUT_MS = 8000;

interface AdapterConfig {
  id: SchoolId;
  feeTableUrl: string;
  sources: { kind: SourceKind; url: string; snapshot: string }[];
  /** 본문 컨테이너 선택자. 학교 CMS마다 다르다. 생략하면 기본 목록을 쓴다. */
  selectors?: string[];
}

/**
 * 학교 어댑터를 만든다.
 *
 * 학교마다 다른 것은 URL과 본문 선택자뿐이고, 실시간 조회·타임아웃·스냅샷
 * 폴백은 모두 같다. 그 공통 부분을 여기 모아 두면 새 학교를 추가할 때
 * 설정만 쓰면 된다.
 */
function createAdapter(config: AdapterConfig): SchoolAdapter {
  return {
    id: config.id,
    feeTableUrl: config.feeTableUrl,

    async fetchRaw(): Promise<RawDoc[]> {
      return Promise.all(
        config.sources.map(async (source) => {
          try {
            const html = await fetchWithTimeout(source.url);
            return {
              kind: source.kind,
              url: source.url,
              text: extractMainText(html, config.selectors),
              fromSnapshot: false,
            };
          } catch (error) {
            // 발표장 네트워크나 학교 측 차단으로 실패해도 데모가 멈추면 안 된다.
            // 대신 화면에 "저장된 사본"이라고 밝힌다 — 조용히 옛날 자료를
            // 최신인 것처럼 보여주면 납부 기한을 잘못 알려줄 수 있다.
            console.warn(`[crawler:${config.id}] ${source.kind} 실시간 조회 실패, 스냅샷 사용:`, error);
            return {
              kind: source.kind,
              url: source.url,
              text: extractMainText(readSnapshot(source.snapshot), config.selectors),
              fromSnapshot: true,
            };
          }
        })
      );
    },
  };
}

/**
 * 고려대학교.
 *
 * 일정과 납부방법이 서로 다른 페이지에 있어 둘 다 읽는다.
 * 날짜 표기: 월 제목("08월") 아래 "24(월) - 28(금) 16:00".
 */
const koreaAdapter = createAdapter({
  id: "korea",
  feeTableUrl: "https://registrar.korea.ac.kr/registrar/tuition/schedule.do",
  selectors: ["#jwxe_main_content"],
  sources: [
    {
      kind: "schedule",
      url: "https://registrar.korea.ac.kr/registrar/tuition/schedule.do",
      snapshot: "korea-schedule.html",
    },
    {
      kind: "payment",
      url: "https://registrar.korea.ac.kr/registrar/tuition/payment.do",
      snapshot: "korea-payment.html",
    },
  ],
});

/**
 * 한양대학교.
 *
 * CMS가 달라 본문 컨테이너가 #content다. 이 어댑터가 있다는 것 자체가
 * 크롤러 구조가 특정 CMS에 묶여 있지 않다는 증거다.
 * 날짜 표기: "2026.08.24.(월) ~ 08.30.(일)" — 학교마다 전혀 다르다.
 */
const hanyangAdapter = createAdapter({
  id: "hanyang",
  feeTableUrl: "https://finance.hanyang.ac.kr/-12",
  selectors: ["#content"],
  sources: [
    { kind: "combined", url: "https://finance.hanyang.ac.kr/-12", snapshot: "hanyang-tuition.html" },
  ],
});

/**
 * 지원하는 학교.
 *
 * SchoolId 전부를 덮지 않는다. 어댑터가 없는 학교는 화면이 "아직 읽어올 수
 * 없다"고 밝힌다 — 없는 일정을 지어내는 것보다 없다고 말하는 편이 낫다.
 */
const ADAPTERS: Partial<Record<SchoolId, SchoolAdapter>> = {
  korea: koreaAdapter,
  hanyang: hanyangAdapter,
};

export function getAdapter(schoolId: SchoolId): SchoolAdapter | null {
  return ADAPTERS[schoolId] ?? null;
}

async function fetchWithTimeout(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FinmateBot/0.1; +https://finmate.app)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function readSnapshot(fileName: string): string {
  return fs.readFileSync(path.join(SNAPSHOT_DIR, fileName), "utf8");
}
