import { memo, type ReactNode, useEffect, useRef, useState } from "react";

const isServer = typeof window === "undefined";

interface Props {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "header" | "footer" | "aside" | "main";
  delay?: number;
  id?: string;
}

export const FadeIn = memo(function FadeIn({ children, className = "", as: Tag = "div", delay = 0, id }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const el = ref.current;
    if (!el) return;

    // После гидрации убираем is-visible (которая была для SSR),
    // чтобы дать IntersectionObserver управлять анимацией
    el.classList.remove("is-visible");

    // Небольшой reflow, чтобы transition сработал
    void el.offsetHeight;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay) {
            timeoutId = setTimeout(() => {
              el.classList.add("is-visible");
            }, delay);
          } else {
            el.classList.add("is-visible");
          }
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [hydrated, delay]);

  // На сервере и до гидрации — рендерим видимым (is-visible)
  const visibleClass = isServer || !hydrated ? "is-visible" : "";

  return (
    <Tag
      ref={ref as React.RefObject<never>}
      id={id}
      className={`fade-section ${visibleClass} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
});
