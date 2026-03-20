import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { HomePage } from "@/app/pages/HomePage";

const CasePage = lazy(() =>
  import("@/app/pages/CasePage").then((m) => ({ default: m.CasePage })),
);

/** Skeleton while CasePage is loading */
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950" aria-busy="true" aria-label="Загрузка страницы">
      {/* Hero skeleton */}
      <div className="relative flex min-h-[75vh] items-end overflow-hidden bg-gray-200 animate-pulse dark:bg-gray-800 md:min-h-[80vh]">
        <div className="relative z-10 w-full pb-12 pt-32 mx-auto max-w-[1140px] px-5 sm:px-8 md:pb-16">
          <div className="mb-8 h-4 w-16 rounded bg-gray-300 dark:bg-gray-700" />
          <div className="mb-4 h-3 w-24 rounded bg-gray-300 dark:bg-gray-700" />
          <div className="mb-3 h-10 w-3/4 max-w-[600px] rounded bg-gray-300 dark:bg-gray-700" />
          <div className="mb-8 h-5 w-1/2 max-w-[400px] rounded bg-gray-300 dark:bg-gray-700" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-gray-300 dark:bg-gray-700" />
            ))}
          </div>
        </div>
      </div>
      {/* Content skeleton */}
      <div className="mx-auto max-w-[1140px] px-5 sm:px-8 py-16 space-y-4">
        <div className="h-4 w-full max-w-[500px] rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-4 w-full max-w-[600px] rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-4 w-full max-w-[450px] rounded bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  );
}

/** Reset scroll to top on route change */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col bg-white transition-colors duration-300 dark:bg-gray-950">
        <Header />
        <main id="main-content" className="flex-1">
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/case/:id" element={<CasePage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
