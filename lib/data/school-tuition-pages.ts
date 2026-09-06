import { SchoolId } from "@/lib/types";

/**
 * 학교별 등록금 안내 페이지.
 *
 * 여기 있는 주소는 크롤러(lib/crawler/adapters.ts)가 실제로 읽고 있는 것과
 * 같다. 확인되지 않은 학교는 넣지 않는다 — 주소를 지어내면 사용자를
 * 없는 페이지로 보내게 되고, 그건 안내가 아니라 방해다.
 *
 * 이 목록에 없는 학교는 화면이 "학교 홈페이지에서 등록금 안내를 찾아
 * 보세요"라고만 말한다. 링크가 없다는 사실을 감추지 않는다.
 */
export const SCHOOL_TUITION_PAGE: Partial<Record<SchoolId, string>> = {
  korea: "https://registrar.korea.ac.kr/registrar/tuition/schedule.do",
  hanyang: "https://finance.hanyang.ac.kr/-12",
  ewha: "https://www.ewha.ac.kr/ewha/etc/tuition01.do",
};

/**
 * 학교 포털.
 *
 * 공지를 우리가 못 읽어 오는 학교에서, 학생이 직접 로그인해 확인할 곳이다.
 * 등록금 안내 페이지(위)와 달리 로그인이 필요하다 — 화면이 그 사실을 함께
 * 말한다.
 *
 * 여기 있는 주소는 전부 실제로 응답하는지 확인했다. 주소를 지어내면
 * 사용자를 없는 페이지로 보내게 되고, 그건 안내가 아니라 방해다.
 */
export const SCHOOL_PORTAL: Partial<Record<SchoolId, string>> = {
  snu: "https://my.snu.ac.kr",
  yonsei: "https://portal.yonsei.ac.kr",
  skk: "https://kingo.skku.edu",
};
