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
 * 언제나 "1 KRW = N"으로 적는다. 통화에 따라 방향을 뒤집으면 중국만
 * "1 CNY = 202 KRW"처럼 혼자 다르게 나와, 나라를 바꿔 가며 비교하는
 * 사람이 매번 어느 쪽 기준인지 다시 읽어야 한다.
 *
 * 작은 값은 유효숫자로 자른다. 0.000741을 그대로 쓰면 자릿수를 세게 되고,
 * 반올림해서 0으로 만들면 아무 뜻이 없다.
 */
export function formatRate(countryCode: string, fx: FxRates | null): string | null {
  const currency = currencyOf(countryCode);
  if (!currency || !fx) return null;
  const rate = fx.rates[currency];
  if (typeof rate !== "number") return null;

  const shown =
    rate >= 1
      ? rate.toFixed(2).replace(/\.00$/, "")
      : rate.toPrecision(3).replace(/0+$/, "").replace(/\.$/, "");

  return `1 KRW = ${shown} ${currency}`;
}

/** 그 나라 통화를 아는지. 모르면 화면이 "환율 정보 없음"이라고 말한다. */
export function hasRate(countryCode: string, fx: FxRates | null): boolean {
  const currency = currencyOf(countryCode);
  return Boolean(currency && fx && typeof fx.rates[currency] === "number");
}
