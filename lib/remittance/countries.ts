import { currencyOf } from "@/lib/data/country-currency";

/**
 * 송금 화면의 금액 표시.
 *
 * 나라 목록은 따로 두지 않는다 — 가입 화면과 같은 lib/data/countries.ts를
 * 그대로 쓴다. 목록이 둘이면 "가입은 되는데 송금은 안 되는 나라"가 생기고,
 * 자기 나라를 못 찾는 사람이 나온다.
 *
 * 환율은 /api/fx에서 실시간으로 받는다. 코드에 박아 두면 발표 몇 주 뒤부터
 * 틀린 금액을 보여주고, 유학생은 그 금액으로 송금 계획을 세운다.
 */

export const DEFAULT_COUNTRY_CODE = "VN";

export interface FxRates {
  rates: Record<string, number>;
  updatedAt: string;
}

/**
 * 받는 금액. 통화마다 소수 자릿수가 다르다.
 *
 * VND나 MNT는 소수점이 의미가 없고(1동 단위), USD·EUR는 센트가 의미가
 * 있다. 한 규칙으로 반올림하면 "0 USD"나 "33,120,000.00 VND"가 나온다.
 *
 * 환율을 모르면 null이다. 모르는 값을 0으로 채우면 "0원 받는다"가 된다.
 */
export function formatReceived(
  amountKrw: number,
  countryCode: string,
  fx: FxRates | null,
  lang: string
): string | null {
  const currency = currencyOf(countryCode);
  if (!currency || !fx) return null;
  const rate = fx.rates[currency];
  if (typeof rate !== "number") return null;

  const value = amountKrw * rate;
  return new Intl.NumberFormat(lang, {
    style: "currency",
    currency,
    maximumFractionDigits: value < 100 ? 2 : 0,
    minimumFractionDigits: 0,
  }).format(value);
}

/**
 * 참고 환율 한 줄.
 *
 * 방향을 통화마다 뒤집지 않는다. 예전에는 값이 작으면 뒤집어서, 중국만
 * "1 CNY = 202 KRW"처럼 혼자 다르게 나왔다. 그렇다고 전부 원화 기준으로
 * 통일하면 "1 KRW = 0.000741 USD"가 되어 자릿수를 세게 된다.
 *
 * 그래서 국내 은행 고시판과 같은 방식을 쓴다 — 언제나 외화가 왼쪽이고,
 * 1단위 값이 1원에 못 미치는 통화(동, 루피아, 원화 대비 아주 작은 단위)는
 * 100단위로 묶는다. 방향이 늘 같으면서 자릿수도 읽을 만해진다.
 *
 *   1 USD = 1,349 KRW
 *   1 CNY = 202 KRW
 *   100 VND = 5.19 KRW
 */
export function formatRate(countryCode: string, fx: FxRates | null): string | null {
  const currency = currencyOf(countryCode);
  if (!currency || !fx) return null;
  const rate = fx.rates[currency];
  if (typeof rate !== "number" || rate <= 0) return null;

  // rate는 1 KRW가 몇 외화인지다. 뒤집으면 1 외화가 몇 원인지가 된다.
  const krwPerUnit = 1 / rate;
  const unit = krwPerUnit < 1 ? 100 : 1;
  const value = krwPerUnit * unit;

  const shown = value >= 100 ? Math.round(value).toLocaleString() : value.toFixed(2);
  return `${unit === 1 ? "1" : "100"} ${currency} = ${shown} KRW`;
}

/** 그 나라 통화를 아는지. 모르면 화면이 "환율 정보 없음"이라고 말한다. */
export function hasRate(countryCode: string, fx: FxRates | null): boolean {
  const currency = currencyOf(countryCode);
  return Boolean(currency && fx && typeof fx.rates[currency] === "number");
}
