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

      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute("content", `Кейс: ${caseStudy.title}. ${caseStudy.niche}. ${caseStudy.role}`);

      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute("href", `https://andrey-mikhaylichenko.ru/case/${caseStudy.id}`);

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", `${caseStudy.title} — Михайличенко Андрей`);

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", `Кейс: ${caseStudy.title}. ${caseStudy.niche}.`);

      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute("content", `https://andrey-mikhaylichenko.ru/case/${caseStudy.id}`);
    }
    return () => {
      document.title = "Михайличенко Андрей — digital-маркетолог с техническим уклоном";
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute("content", "Михайличенко Андрей — digital-маркетолог с техническим уклоном. Портфолио и кейсы: performance-маркетинг, воронки, аналитика, digital-инфраструктура.");
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute("href", "https://andrey-mikhaylichenko.ru/");
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", "Михайличенко Андрей — digital-маркетолог с техническим уклоном");
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", "Портфолио и кейсы: performance-маркетинг, воронки, аналитика, digital-инфраструктура.");
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute("content", "https://andrey-mikhaylichenko.ru/");
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
