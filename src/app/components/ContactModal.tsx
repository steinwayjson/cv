import { memo, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Mail, Phone, Send, MessageCircle } from "lucide-react";
import { personalInfo } from "@/data/portfolioData";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

const phoneRaw = personalInfo.phone.replace(/[^+\d]/g, "");

const channels = [
  {
    icon: Send,
    label: "Telegram",
    href: personalInfo.socialLinks.find((l) => l.label === "Telegram")?.href ?? "#",
    desc: "Быстрый ответ в мессенджере",
    iconColor: "text-[#229ED9]",
    bgColor: "bg-[#229ED9]/10 dark:bg-[#229ED9]/15",
  },
  {
    icon: MessageCircle,
    label: "MAX",
    href: personalInfo.socialLinks.find((l) => l.label === "MAX")?.href ?? "#",
    desc: "Написать в MAX",
    iconColor: "text-[#0077FF]",
    bgColor: "bg-[#0077FF]/10 dark:bg-[#0077FF]/15",
  },
  {
    icon: Phone,
    label: personalInfo.phone,
    href: `tel:${phoneRaw}`,
    desc: "Позвонить напрямую",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    icon: Mail,
    label: personalInfo.email,
    href: `mailto:${personalInfo.email}`,
    desc: "Написать на почту",
    iconColor: "text-orange-500 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
  },
];

export const ContactModal = memo(function ContactModal({
  open,
  onClose,
}: ContactModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const modal = overlayRef.current;
        if (!modal) return;
        const focusable = modal.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    overlayRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Способы связи"
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 outline-none backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
        <div className="relative w-full max-w-[420px] rounded-2xl border border-border bg-card p-6 shadow-2xl ring-1 ring-black/5 dark:ring-white/5">
        {/* Закрыть */}
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Заголовок */}
        <h2 className="mb-5 text-xl font-bold">
          Связаться
        </h2>

        {/* Каналы связи */}
        <div className="flex flex-col gap-2">
          {channels.map((ch) => (
            <a
              key={ch.label}
              href={ch.href}
              target={ch.href.startsWith("http") ? "_blank" : undefined}
              rel={ch.href.startsWith("http") ? "noreferrer" : undefined}
              className="flex items-center gap-4 rounded-xl border border-border px-4 py-3.5 transition-[border-color,background-color,box-shadow] hover:border-border hover:bg-accent hover:shadow-sm active:scale-[0.99]"
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${ch.bgColor}`}>
                <ch.icon className={`h-5 w-5 ${ch.iconColor}`} />
              </span>
              <div className="min-w-0 overflow-hidden">
                <p className="text-sm font-semibold truncate">
                  {ch.label}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {ch.desc}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
});
