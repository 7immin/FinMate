import * as cheerio from "cheerio";

/** 대부분의 국내 대학 CMS가 쓰는 본문 컨테이너부터 순서대로 시도한다. */
const DEFAULT_SELECTORS = ["#jwxe_main_content", "#contentsEditHtml", "#content", "#contents"];

/**
 * 대학 공지 HTML에서 본문 평문만 남긴다.
 *
 * 공지 HTML은 문장 중간에 <span style="letter-spacing:...">로 조각나 있어
 * 정규식으로 필드를 뽑는 것이 사실상 불가능하다 (예: "일반/특수/전문대학원"이
 * 두 개의 span으로 쪼개짐). 그래서 평문으로만 정리해 LLM에 넘기고,
 * 구조화는 LLM이 맡는다.
 *
 * selectors를 대학별로 받는 이유: 학교마다 CMS가 달라 본문 컨테이너 id가
 * 다르다. 맞는 것이 없으면 body 전체로 떨어지는데, 그러면 메뉴와 푸터까지
 * 딸려 들어가 LLM 입력이 지저분해진다.
 */
export function extractMainText(html: string, selectors: string[] = DEFAULT_SELECTORS): string {
  const $ = cheerio.load(html);

  $("script, style, nav, header, footer, .header-top-wrap, .header-bottom-wrap, .path-wrap").remove();

  const hit = selectors.find((selector) => $(selector).length > 0);
  const main = hit ? $(hit) : $("body");

  // 블록 요소 사이에는 줄바꿈을 넣어 "01(수) - 03(수) 등록"처럼 항목이 이어져
  // 붙어버리는 것을 막는다. 표로 일정을 싣는 학교가 있어 td/th도 포함한다.
  main.find("br").replaceWith("\n");
  main.find("p, li, h3, h4, h5, div, td, th, caption").each((_, el) => {
    $(el).append("\n");
  });

  return main
    .text()
    .replace(/ /g, " ")
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}
