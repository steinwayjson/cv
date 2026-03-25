import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import { Routes, Route } from "react-router-dom";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";
import { HomePage } from "@/app/pages/HomePage";
import { CasePage } from "@/app/pages/CasePage";

export function render(url: string) {
  return renderToString(
    <StaticRouter location={url}>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main id="main-content" className="flex-1">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/case/:id" element={<CasePage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </StaticRouter>,
  );
}
