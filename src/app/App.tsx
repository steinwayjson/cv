import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";
import { HomePage } from "@/app/pages/HomePage";
import { capturePageview } from "@/lib/analytics";

const CasePage = lazy(() =>
  import("@/app/pages/CasePage").then((m) => ({ default: m.CasePage })),
);

/** Заглушка на время загрузки страницы кейса */
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background" aria-busy="true" aria-label="Загрузка страницы">
      {/* Скелет шапки */}
      <div className="relative flex min-h-[75vh] items-end overflow-hidden bg-accent animate-pulse md:min-h-[80vh]">
        <div className="relative z-10 w-full pb-12 pt-32 mx-auto max-w-[1800px] px-6 md:px-12 md:pb-16">
          <div className="mb-8 h-4 w-16 rounded bg-muted" />
          <div className="mb-4 h-3 w-24 rounded bg-muted" />
          <div className="mb-3 h-10 w-3/4 max-w-[600px] rounded bg-muted" />
          <div className="mb-8 h-5 w-1/2 max-w-[400px] rounded bg-muted" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      </div>
      {/* Скелет контента */}
      <div className="mx-auto max-w-[1800px] px-6 md:px-12 py-16 space-y-4">
        <div className="h-4 w-full max-w-[500px] rounded bg-accent" />
        <div className="h-4 w-full max-w-[600px] rounded bg-accent" />
        <div className="h-4 w-full max-w-[450px] rounded bg-accent" />
      </div>
    </div>
  );
}

/** При переходе на другую страницу — скролл наверх + хит Метрики + PostHog pageview */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    if (typeof window.ym === 'function') {
      window.ym(108302991, 'hit', window.location.href, { referrer: document.referrer });
    }
    capturePageview();
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main id="main-content" className="flex-1">
          <ErrorBoundary>
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/case/:id" element={<CasePage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
