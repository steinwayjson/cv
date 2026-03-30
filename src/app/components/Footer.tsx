import { memo } from "react";
import { personalInfo } from "@/data/portfolioData";


const CURRENT_YEAR = new Date().getFullYear();

export const Footer = memo(function Footer() {
  return (
    <footer className="border-t border-border py-16 md:py-24">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* CTA */}
          <div>
            <h3 className="text-2xl md:text-3xl font-medium mb-4">
              Обсудить проект?
            </h3>
            <p className="text-muted-foreground">
              Открыт к сотрудничеству и интересным задачам. Свяжитесь со мной
              удобным способом.
            </p>
          </div>

          {/* Ссылки и контакты */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium mb-4">Социальные сети</h4>
              <ul className="space-y-2">
                {personalInfo.socialLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Контакты</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>{personalInfo.location}</li>
                <li>
                  <a
                    href={`tel:${personalInfo.phone.replace(/[^+\d]/g, "")}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {personalInfo.phone}
                  </a>
                </li>
                <li className="break-all">
                  <a
                    href={`mailto:${personalInfo.email}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {personalInfo.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Копирайт */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {CURRENT_YEAR} {personalInfo.name}</p>
          <p>{personalInfo.title}</p>
        </div>

        {/* Юридическая сноска */}
        <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground/40">
          *Instagram и Facebook принадлежат компании Meta Platforms Inc., признанной экстремистской организацией и запрещённой на территории Российской Федерации.
        </p>
      </div>
    </footer>
  );
});
