"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { UploadBox } from "@/components/ui/UploadBox";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { CONTRACT_TYPES, LEASE_CONTRACT } from "@/lib/mock/deposit";

export function ContractUploadStep({ onVerify }: { onVerify: () => void }) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [contractType, setContractType] = useState(CONTRACT_TYPES[0]);

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="월세·보증금" />
      <div className="flex-1 space-y-6 px-5 pb-6 pt-2">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">보증금은 되돌리기 어렵습니다</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-foreground-muted">
            계약서를 올리면 집주인 명의와 등기부를 대조해 위험을 먼저 알려드립니다.
          </p>
        </div>

        <UploadBox
          label="임대차 계약서"
          fileName={fileName ?? undefined}
          onFileSelected={() => setFileName(`${LEASE_CONTRACT.fileName} · ${LEASE_CONTRACT.pages} pages`)}
        />

        <div>
          <p className="mb-2 text-sm text-foreground-muted">계약 유형</p>
          <div className="flex gap-2">
            {CONTRACT_TYPES.map((type) => (
              <Chip key={type} selected={contractType === type} onClick={() => setContractType(type)}>
                {type}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-foreground-subtle">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>계약서는 검증에만 쓰이고 집주인이나 부동산에 공유되지 않습니다.</span>
        </div>
      </div>
      <div className="px-5 pb-6">
        <Button onClick={onVerify} disabled={!fileName}>
          검증 시작
        </Button>
      </div>
    </div>
  );
}
