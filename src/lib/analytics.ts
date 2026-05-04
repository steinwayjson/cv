import posthog from 'posthog-js';

/**
 * Инициализация PostHog.
 * Вызывается один раз в main.tsx — только на клиенте, никогда на сервере.
 */
export function initAnalytics(): void {
  const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  if (!key) return;

  posthog.init(key, {
    api_host: (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://us.i.posthog.com',

    // SPA: pageview-события отправляем вручную из ScrollToTop,
    // иначе PostHog засчитает только первую загрузку и пропустит переходы.
    capture_pageview: false,

    // Создаём анонимные профили — нужно для session recording и heat map.
    person_profiles: 'always',
  });
}

/**
 * Трекинг перехода на страницу.
 * Вызывается из ScrollToTop при каждом изменении маршрута.
 */
export function capturePageview(): void {
  posthog.capture('$pageview');
}

/**
 * Произвольное событие, например:
 *   capture('contact_modal_open')
 *   capture('case_viewed', { case_id: 'revitale' })
 */
export function capture(event: string, properties?: Record<string, unknown>): void {
  posthog.capture(event, properties);
}
