"use client";

import { TopBar } from "@/components/layout/TopBar";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface Section {
  title: string;
  body: string;
}

function SectionList({ heading, sections }: { heading: string; sections: Section[] }) {
  return (
    <div>
      <h2 className="text-[17px] font-bold text-foreground">{heading}</h2>
      <Card className="mt-3 space-y-4">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-[14px] font-semibold text-foreground">{section.title}</p>
            <p className="mt-1 text-[14px] leading-relaxed text-foreground-muted">{section.body}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}

export default function TermsPage() {
  const { t, tNode } = useTranslation();
  const tosSections = tNode<Section[]>("more.terms.tos.sections");
  const privacySections = tNode<Section[]>("more.terms.privacy.sections");

  return (
    <AppShell className="flex flex-col">
      <TopBar title={t("more.terms.title")} />
      <div className="space-y-8 px-5 pb-10 pt-2">
        <p className="text-xs text-foreground-subtle">{t("more.terms.updatedAt")}</p>
        <SectionList heading={t("more.terms.tos.heading")} sections={tosSections} />
        <SectionList heading={t("more.terms.privacy.heading")} sections={privacySections} />
      </div>
    </AppShell>
  );
}
