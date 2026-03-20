import { memo, type ReactNode, useEffect, useRef } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "header" | "footer" | "aside" | "main";
  delay?: number;
  id?: string;
}

export const FadeIn = memo(function FadeIn({ children, className = "", as: Tag = "div", delay = 0, id }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

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
  }, [delay]);

  return (
    <Tag
      ref={ref as React.RefObject<never>}
      id={id}
      className={`fade-section ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
});
