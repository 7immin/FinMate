"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { UploadBox } from "@/components/ui/UploadBox";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { CONTRACT_TYPE_IDS, ContractTypeId, LEASE_CONTRACT } from "@/lib/mock/deposit";

export function ContractUploadStep({ onVerify }: { onVerify: () => void }) {
  const { t } = useTranslation();
  const [fileName, setFileName] = useState<string | null>(null);
  const [contractType, setContractType] = useState<ContractTypeId>(CONTRACT_TYPE_IDS[0]);

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("deposit.topBarTitle")} />
      <div className="flex-1 space-y-6 px-5 pb-6 pt-2">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">{t("deposit.upload.headline")}</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-foreground-muted">
            {t("deposit.upload.description")}
          </p>
        </div>

        <UploadBox
          label={t("deposit.upload.boxLabel")}
          fileName={fileName ?? undefined}
          onFileSelected={() => setFileName(`${LEASE_CONTRACT.fileName} · ${LEASE_CONTRACT.pages} pages`)}
        />

        <div>
          <p className="mb-2 text-sm text-foreground-muted">{t("deposit.upload.typeLabel")}</p>
          <div className="flex gap-2">
            {CONTRACT_TYPE_IDS.map((type) => (
              <Chip key={type} selected={contractType === type} onClick={() => setContractType(type)}>
                {t(`deposit.contractType.${type}`)}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-foreground-subtle">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{t("deposit.upload.privacyNote")}</span>
        </div>
      </div>
      <div className="px-5 pb-6">
        <Button onClick={onVerify} disabled={!fileName}>
          {t("deposit.upload.submit")}
        </Button>
      </div>
    </div>
  );
}
