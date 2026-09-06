/**
 * 송금 가능 국가와 통화.
 *
 * 나라 이름은 여기 적지 않는다. lib/data/countries.ts와 같은 규약으로
 * ISO 코드만 두고, 이름은 translateShared("country", code)가 만든다.
 *
 * 그 목록(가입 시 국적 선택)과 이 목록이 다른 이유: 국적은 어느 나라든
 * 고를 수 있어야 하지만, 송금은 통화와 환율을 아는 나라에만 보낼 수 있다.
 * 모르는 나라를 목록에 넣으면 받는 금액을 잘못 계산해 보여주게 된다.
 *
 * 환율은 고정값이다. 실시간 시세를 붙이려면 환율 API 계약이 필요한데,
 * 그건 이 앱이 혼자 정할 수 있는 일이 아니다. 대신 화면에서 "참고 환율,
 * 기준일"이라고 밝히고 실제 송금 금액은 은행 고시 환율을 따른다고 적는다 —
 * 지어낸 숫자를 확정 금액처럼 보여주면 사용자가 그 금액으로 계획을 세운다.
 */

export interface RemittanceCountry {
  /** ISO 3166-1 alpha-2 (대문자). lib/data/countries.ts와 같은 표기다. */
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
  { code: "VN", currency: "VND", perKrw: 18.4 },
  { code: "CN", currency: "CNY", perKrw: 0.0052 },
  { code: "MN", currency: "MNT", perKrw: 2.55 },
  { code: "NP", currency: "NPR", perKrw: 0.1 },
  { code: "MM", currency: "MMK", perKrw: 1.55 },
  { code: "UZ", currency: "UZS", perKrw: 9.2 },
  { code: "KH", currency: "KHR", perKrw: 2.95 },
  { code: "ID", currency: "IDR", perKrw: 11.9 },
  { code: "PH", currency: "PHP", perKrw: 0.042 },
  { code: "TH", currency: "THB", perKrw: 0.024 },
  { code: "IN", currency: "INR", perKrw: 0.063 },
  { code: "BD", currency: "BDT", perKrw: 0.088 },
  { code: "PK", currency: "PKR", perKrw: 0.2 },
  { code: "LK", currency: "LKR", perKrw: 0.22 },
  { code: "JP", currency: "JPY", perKrw: 0.11 },
  { code: "US", currency: "USD", perKrw: 0.00072 },
  { code: "RU", currency: "RUB", perKrw: 0.06 },
  { code: "KZ", currency: "KZT", perKrw: 0.36 },
  { code: "TR", currency: "TRY", perKrw: 0.029 },
  { code: "FR", currency: "EUR", perKrw: 0.00066 },
  { code: "DE", currency: "EUR", perKrw: 0.00066 },
  { code: "GB", currency: "GBP", perKrw: 0.00056 },
  { code: "CA", currency: "CAD", perKrw: 0.001 },
  { code: "AU", currency: "AUD", perKrw: 0.0011 },
];

export const DEFAULT_COUNTRY_CODE = "VN";

export function findCountry(code: string): RemittanceCountry | undefined {
  const upper = code.toUpperCase();
  return REMITTANCE_COUNTRIES.find((country) => country.code === upper);
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
