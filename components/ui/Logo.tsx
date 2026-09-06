import Image from "next/image";
import { cn } from "@/lib/utils/cn";

/**
 * FinMate 로고.
 *
 * 원본은 밝은 바탕을 전제로 만든 그림이라 "Fin"의 남색이 이 앱의 검은
 * 판(#0A0A0F) 위에서 거의 사라진다. 목업이 쓴 방법을 그대로 옮긴다 —
 * 사방으로 아주 얇은 흰 그림자를 네 번 겹쳐 글자에 1px 흰 테두리를
 * 두르는 것. 로고 파일을 두 벌로 나누지 않고 한 벌로 두 바탕을 다 받는다.
 */
const OUTLINE =
  "drop-shadow(0.6px 0 0 #fff) drop-shadow(-0.6px 0 0 #fff) drop-shadow(0 0.6px 0 #fff) drop-shadow(0 -0.6px 0 #fff)";

const OUTLINE_GLOW = `${OUTLINE} drop-shadow(0 0 20px rgba(108,92,231,0.35))`;

export function Logo({
  height = 20,
  glow = false,
  className,
}: {
  /** 로고 높이(px). 가로 폭은 원본 비율(358×88)로 따라간다. */
  height?: number;
  /** 진입 화면처럼 로고 하나만 놓이는 자리에서 보랏빛 번짐을 더한다. */
  glow?: boolean;
  className?: string;
}) {
  return (
    <Image
      src="/finmate-logo.png"
      alt="FinMate"
      width={Math.round((358 / 88) * height)}
      height={height}
      priority
      className={cn("block w-auto", className)}
      style={{ height, filter: glow ? OUTLINE_GLOW : OUTLINE }}
    />
  );
}
