/**
 * 송금 가능 국가와 통화.
 *
 * 나라 이름은 여기 적지 않는다. 이 앱은 네 언어를 쓰고, 나라 이름을 네 벌
 * 적어 두면 나라를 하나 더할 때마다 네 곳을 고쳐야 한다. 브라우저의
 * Intl.DisplayNames가 ISO 코드에서 그 언어의 이름을 만들어 주므로
 * 코드와 통화만 여기 둔다.
 *
 * 환율은 고정값이다. 실시간 시세를 붙이려면 환율 API 계약이 필요한데,
 * 그건 이 앱이 혼자 정할 수 있는 일이 아니다. 대신 화면에서 "참고 환율,
 * 기준일"이라고 밝히고 실제 송금 금액은 은행 고시 환율을 따른다고 적는다 —
 * 지어낸 숫자를 확정 금액처럼 보여주면 사용자가 그 금액으로 계획을 세운다.
 */

export interface RemittanceCountry {
  /** ISO 3166-1 alpha-2 (소문자). Intl.DisplayNames의 입력이다. */
  code: string;
  /** ISO 4217 통화 코드. */
  currency: string;
  /** 1 KRW가 몇 단위인지. */
  perKrw: number;
}

/** 환율 기준일. 화면에 그대로 밝힌다. */
export const RATE_AS_OF = "2026-09-01";

/**
 * 국내 체류 외국인 유학생이 실제로 송금하는 나라 위주로 담았다.
 * 여기 없는 나라는 검색해도 나오지 않는다 — 통화와 환율을 모르는 나라를
 * 목록에 넣으면 금액을 잘못 계산해 보여주게 된다.
 */
export const REMITTANCE_COUNTRIES: RemittanceCountry[] = [
  { code: "vn", currency: "VND", perKrw: 18.4 },
  { code: "cn", currency: "CNY", perKrw: 0.0052 },
  { code: "mn", currency: "MNT", perKrw: 2.55 },
  { code: "np", currency: "NPR", perKrw: 0.1 },
  { code: "mm", currency: "MMK", perKrw: 1.55 },
  { code: "uz", currency: "UZS", perKrw: 9.2 },
  { code: "kh", currency: "KHR", perKrw: 2.95 },
  { code: "id", currency: "IDR", perKrw: 11.9 },
  { code: "ph", currency: "PHP", perKrw: 0.042 },
  { code: "th", currency: "THB", perKrw: 0.024 },
  { code: "in", currency: "INR", perKrw: 0.063 },
  { code: "bd", currency: "BDT", perKrw: 0.088 },
  { code: "pk", currency: "PKR", perKrw: 0.2 },
  { code: "lk", currency: "LKR", perKrw: 0.22 },
  { code: "jp", currency: "JPY", perKrw: 0.11 },
  { code: "us", currency: "USD", perKrw: 0.00072 },
  { code: "ru", currency: "RUB", perKrw: 0.06 },
  { code: "kz", currency: "KZT", perKrw: 0.36 },
  { code: "tr", currency: "TRY", perKrw: 0.029 },
  { code: "fr", currency: "EUR", perKrw: 0.00066 },
  { code: "de", currency: "EUR", perKrw: 0.00066 },
  { code: "gb", currency: "GBP", perKrw: 0.00056 },
  { code: "ca", currency: "CAD", perKrw: 0.001 },
  { code: "au", currency: "AUD", perKrw: 0.0011 },
];

export const DEFAULT_COUNTRY_CODE = "vn";

export function findCountry(code: string): RemittanceCountry | undefined {
  return REMITTANCE_COUNTRIES.find((country) => country.code === code);
}

/**
 * 그 언어로 된 나라 이름.
 *
 * Intl.DisplayNames를 지원하지 않는 환경에서는 코드를 대문자로 돌려준다 —
 * 이름을 못 만들었다고 목록이 통째로 비면 송금을 아예 못 하게 된다.
 */
export function countryName(code: string, lang: string): string {
  try {
    return new Intl.DisplayNames([lang], { type: "region" }).of(code.toUpperCase()) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

/**
 * 받는 금액. 통화마다 소수 자릿수가 다르다.
 *
 * VND나 MNT는 소수점이 의미가 없고(1동 단위), USD·EUR는 센트가 의미가
 * 있다. 한 규칙으로 반올림하면 "0 USD"나 "33,120,000.00 VND"가 나온다.
 */
export function formatReceived(amountKrw: number, country: RemittanceCountry, lang: string): string {
  const value = amountKrw * country.perKrw;
  const fractionDigits = value < 100 ? 2 : 0;
  return new Intl.NumberFormat(lang, {
    style: "currency",
    currency: country.currency,
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
}

/** "1 KRW = 18.4 VND" 형태의 참고 환율 문구. */
export function formatRate(country: RemittanceCountry): string {
  // 0.00072처럼 아주 작은 값은 1 KRW 기준으로 적으면 읽을 수 없다.
  // 그럴 때는 방향을 뒤집어 "1 USD = 1,389 KRW"로 적는다.
  if (country.perKrw < 0.01) {
    return `1 ${country.currency} = ${Math.round(1 / country.perKrw).toLocaleString()} KRW`;
  }
  return `1 KRW = ${country.perKrw} ${country.currency}`;
}
