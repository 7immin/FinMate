import { Language, SchoolId } from "@/lib/types";

/** 네 언어를 함께 담는 문자열. ko가 공지 원문이고 나머지는 번역이다. */
export type LocalizedText = Record<Language, string>;

/** 대학 공지에서 뽑아낸 등록 일정 한 건. */
export interface EnrollmentEntry {
  /**
   * 항목명. ko가 공지 원문 그대로이고 나머지는 번역이다.
   *
   * 번역을 붙이는 이유: 이 앱을 쓰는 사람은 한국어를 못 읽는 유학생이다.
   * "2026학년도 2학기 재학생 정규 등록"을 그대로 보여주면 정작 자기 납부
   * 기간을 알 수 없다. ko를 원문으로 남겨 두어 출처 대조는 여전히 가능하다.
   */
  label: LocalizedText;
  kind: "regular" | "installment" | "additional" | "excess" | "freshman" | "other";
  /** 분할납부 회차. 해당 없으면 null. */
  installmentRound: number | null;
  /** 시작일 (YYYY-MM-DD). */
  startDate: string;
  /** 종료일 (YYYY-MM-DD). */
  endDate: string;
  /** 마감 시각 (HH:mm). 공지에 없으면 null. */
  endTime: string | null;
}

/** 납부 방법 안내에서 뽑아낸 제약 조건. */
export interface PaymentTerms {
  /** 납부 수단. 한국어 원문과 번역을 함께 담는다. */
  methods: LocalizedText[];
  /** 가상계좌 은행. 은행명도 언어마다 통용 표기가 다르다(신한은행 / Shinhan Bank). */
  virtualAccountBank: LocalizedText | null;
  /**
   * 분할 "송금" 허용 여부. 분할 "납부"와 헷갈리면 안 된다.
   *
   * - 분할납부: 학교가 등록금을 여러 회차로 쪼개 주는 제도. 회차마다 마감일과
   *   가상계좌 금액이 따로 있다. 두 학교 모두 이것은 허용한다.
   * - 분할송금: 그 한 회차 금액을 은행에서 여러 번에 나눠 보내는 것. 가상계좌가
   *   정확한 금액만 받기 때문에 금지된다.
   *
   * 이 필드가 이 서비스의 존재 이유다. 학교는 분할송금을 금지하면서 동시에
   * "이체한도를 사전에 확인하라"고 안내한다 — 기본 한도로는 한 회차조차 한 번에
   * 보낼 수 없는 유학생에게는 해결 불가능한 조건이 된다.
   */
  splitTransferAllowed: boolean;
  /**
   * 금지 근거가 된 공지 원문 한 문장.
   *
   * 이 문장이 없으면 화면은 금지 경고를 띄우지 않는다. "어디에 그렇게
   * 적혀 있냐"에 답하지 못하는 경고는 사용자를 겁주기만 하고, 모델이
   * 지어낸 것인지 아닌지도 구분할 수 없다. 근거를 요구하는 것이 곧
   * 지어내기를 막는 장치다.
   */
  splitTransferNote: LocalizedText | null;
  notes: LocalizedText[];
}

export interface EnrollmentNotice {
  schoolId: SchoolId;
  /**
   * 학기. "2026학년도 2학기"처럼 한국 학사 용어라 그대로 두면 번역이 빠진다.
   * 화면에서 가장 먼저 읽히는 줄이라 특히 눈에 띈다.
   */
  term: LocalizedText;
  entries: EnrollmentEntry[];
  terms: PaymentTerms;
  /** 실시간 조회가 막혀 저장된 스냅샷으로 떨어졌는지. 화면에서 밝힌다. */
  fromSnapshot: boolean;
  sources: string[];
  fetchedAt: string;
}

export type SourceKind = "schedule" | "payment" | "combined";

export interface RawDoc {
  kind: SourceKind;
  url: string;
  text: string;
  fromSnapshot: boolean;
}

export interface SchoolAdapter {
  id: SchoolId;
  /** 등록금 고지 금액을 확인할 수 있는 페이지. 안내용 링크. */
  feeTableUrl: string;
  fetchRaw(): Promise<RawDoc[]>;
}
