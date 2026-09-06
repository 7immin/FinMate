import { SchoolId } from "@/lib/types";
import { getAdapter } from "./adapters";
import { extractEnrollmentNotice } from "./extract";
import { EnrollmentNotice } from "./types";

/**
 * 캐시 유효 기간.
 *
 * 등록 일정은 학기당 몇 번밖에 바뀌지 않으므로 6시간이면 충분히 최신이다.
 * 이 캐시가 없으면 화면을 열 때마다 크롤링과 Gemini 호출이 일어나, 무료
 * 할당량(하루 20회)이 몇 번의 시연만으로 소진되고 응답도 30초를 넘는다.
 */
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

/**
 * 캐시를 Supabase가 아니라 프로세스 메모리에 둔다.
 *
 * 공지는 학교 것이지 사용자 것이 아니라 사용자별로 나눌 필요가 없고,
 * 값이 틀려도 다시 읽으면 그만이라 영속성이 필요하지 않다. 테이블을 만들면
 * 팀원이 Supabase에서 마이그레이션을 돌려야 하는데, 그만한 값어치가 없다.
 *
 * 대신 서버가 재시작되거나 인스턴스가 여럿이면 캐시가 비어 다시 읽는다.
 * 할당량 보호가 목적이므로 그 정도면 충분하다.
 */
const cache = new Map<SchoolId, { notice: EnrollmentNotice; at: number }>();

export interface NoticeResult {
  notice: EnrollmentNotice;
  /** 캐시에서 나왔는지. 실제 크롤링이 돌았는지 구분하는 데 쓴다. */
  cached: boolean;
}

/** 이 학교의 공지를 읽어올 수 있는지. 화면이 미리 물어본다. */
export function isSupported(schoolId: SchoolId): boolean {
  return getAdapter(schoolId) !== null;
}

export async function getEnrollmentNotice(schoolId: SchoolId): Promise<NoticeResult | null> {
  const adapter = getAdapter(schoolId);
  if (!adapter) return null;

  const hit = cache.get(schoolId);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return { notice: hit.notice, cached: true };
  }

  const docs = await adapter.fetchRaw();
  const notice = await extractEnrollmentNotice(schoolId, docs);
  cache.set(schoolId, { notice, at: Date.now() });

  return { notice, cached: false };
}

/**
 * 다음 납부 마감일까지 남은 날.
 *
 * 오늘 이후에 끝나는 등록 기간 중 가장 이른 것을 고른다. 이미 지난 기간을
 * 세면 음수가 나와 "D+3"처럼 아무 뜻 없는 값이 화면에 뜬다.
 * 읽어낸 마감일이 하나도 없으면 null — 지어낸 D-day는 없는 것만 못하다.
 */
export function daysUntilDue(notice: EnrollmentNotice, now = new Date()): number | null {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  const upcoming = notice.entries
    .map((entry) => Date.parse(`${entry.endDate}T00:00:00Z`))
    .filter((time) => Number.isFinite(time) && time >= today)
    .sort((a, b) => a - b)[0];

  if (upcoming === undefined) return null;
  return Math.round((upcoming - today) / 86_400_000);
}
