import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * 로그인하지 않아도 열리는 화면.
 *
 * "/"가 여기 있는 것이 핵심이다 — 이 앱을 처음 여는 사람이 가장 먼저
 * 만나는 것이 로그인 벽이면, 무엇을 해 주는 앱인지 알기도 전에 가입을
 * 요구받는 꼴이 된다. 루트는 비로그인 홈을 직접 그리고, 로그인한
 * 사용자만 app/page.tsx가 /home이나 /onboarding으로 넘긴다.
 */
const PUBLIC_PATHS = ["/", "/login", "/signup", "/bank"];

/**
 * 비로그인 홈에서 질문을 던질 수 있어야 하므로 상담 화면도 함께 연다.
 *
 * "/bank"도 공개다. 그 화면을 쓰는 사람은 학생이 아니라 은행 직원이고,
 * 창구에서 계정을 만들라고 하면 아무도 쓰지 않는다. 노출 범위는 이미
 * 공개인 /verify/[code]와 같다 — 학생이 건넨 코드가 있어야만 조회된다.
 *
 * "/bank/"로 시작하는 하위 경로도 같은 이유로 공개다. 예를 들어
 * /bank/evidence(증빙 서류 링크 안내 화면)를 막아 두면, 담당자가 그 화면을
 * 열자마자 로그인 화면으로 튕겨 나간다 — 애초에 이 앱 계정이 없는 사람인데.
 */
const PUBLIC_PREFIXES = ["/guest/", "/bank/"];

/**
 * 인증 없이 부를 수 있는 API.
 *
 * 이 목록에 무언가를 더할 때는 그 라우트가 스스로 문턱을 갖는지 확인해야
 * 한다. /api/ai/guest-chat은 Supabase를 아예 부르지 않고, /api/bank/*는
 * 창구 접근 코드(BANK_ACCESS_CODE)를 헤더로 요구한다. 그 둘 중 어느
 * 쪽도 아닌 라우트가 여기 들어오는 순간 남의 데이터가 로그인 없이 나간다.
 */
const PUBLIC_API_PATHS = ["/api/ai/guest-chat", "/api/bank/verify", "/api/bank/requests"];

export async function middleware(request: NextRequest) {
  // Publicly viewable regardless of auth state (e.g. a bank teller scanning a QR).
  if (request.nextUrl.pathname.startsWith("/verify/")) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  // 공개 API도 공개 경로에 포함해야 한다. 아래 리다이렉트 규칙이 "공개
  // 경로가 아니면 /login으로"이므로, 여기서 빼면 401 대신 로그인 화면
  // HTML이 fetch 응답으로 돌아온다.
  const isPublicPath =
    PUBLIC_PATHS.includes(path) ||
    PUBLIC_API_PATHS.includes(path) ||
    PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix));
  const isApiPath = path.startsWith("/api/") && !PUBLIC_API_PATHS.includes(path);

  if (!user && isApiPath) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 로그인한 사람이 로그인·가입 화면에 다시 오면 앱으로 되돌린다.
  // "/"는 여기서 제외한다 — 이제 공개 경로라서, 되돌리면 app/page.tsx가
  // 다시 "/"로 보내는 무한 리다이렉트가 된다. 그 화면은 스스로
  // 로그인 여부를 보고 /home이나 /onboarding으로 넘긴다.
  if (user && (path === "/login" || path === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // public/ 아래 정적 파일도 빼야 한다. 안 빼면 로그인 안 한 방문자에게
  // 이미지 요청까지 /login으로 튕기고, 특히 next/image의 최적화 서버가
  // 원본을 HTTP로 다시 가져올 때 리다이렉트를 받아 "유효한 이미지가
  // 아니다"로 실패한다 — 비로그인 홈에서 로고가 통째로 사라진다.
  matcher: [
    "/((?!_next/static|_next/image|icon.svg|favicon.ico|.*\.(?:png|jpg|jpeg|gif|webp|svg|ico|avif)$).*)",
  ],
};
