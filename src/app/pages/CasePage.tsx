import { useParams, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { caseStudies } from "@/data/portfolioData";
import { CaseLayout } from "@/app/components/CaseLayout";

export function CasePage() {
  const { id } = useParams<{ id: string }>();
  const caseIdx = caseStudies.findIndex((c) => c.id === id);
  const caseStudy = caseStudies[caseIdx];
  const nextCase = caseStudies[(caseIdx + 1) % caseStudies.length];

  useEffect(() => {
    if (caseStudy) {
      document.title = `${caseStudy.title} — Михайличенко Андрей`;
    }
    return () => {
      document.title = "Михайличенко Андрей — digital-маркетолог с техническим уклоном";
    };
  }, [caseStudy]);

  if (!caseStudy) return <Navigate to="/" replace />;

  return (
    <CaseLayout
      caseStudy={caseStudy}
      nextCase={nextCase}
    />
  );
}
