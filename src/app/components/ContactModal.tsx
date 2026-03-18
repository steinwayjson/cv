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
      <div className="relative w-full max-w-[420px] rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xl ring-1 ring-black/5 dark:border-white/10 dark:bg-gray-900 dark:ring-white/5">
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-white/10 dark:hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <h2 className="mb-5 text-xl font-bold text-gray-900 dark:text-gray-100">
          Связаться
        </h2>

        {/* Channels */}
        <div className="flex flex-col gap-2">
          {channels.map((ch) => (
            <a
              key={ch.label}
              href={ch.href}
              target={ch.href.startsWith("http") ? "_blank" : undefined}
              rel={ch.href.startsWith("http") ? "noreferrer" : undefined}
              className="flex items-center gap-4 rounded-xl border border-gray-100 px-4 py-3.5 transition-all hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm active:scale-[0.99] dark:border-white/8 dark:hover:border-white/15 dark:hover:bg-white/5"
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${ch.bgColor}`}>
                <ch.icon className={`h-5 w-5 ${ch.iconColor}`} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {ch.label}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
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
