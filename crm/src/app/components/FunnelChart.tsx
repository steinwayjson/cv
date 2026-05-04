import { ChevronDown } from 'lucide-react';

export interface FunnelStep {
  label: string;
  count: number;
  color: string;
  conversion?: number | null; // конверсия из предыдущего шага, %
}

export function FunnelChart({
  steps,
  rejected,
}: {
  steps: FunnelStep[];
  rejected?: number;
}) {
  const first = steps[0]?.count || 1;

  return (
    <div className="w-full flex flex-col items-center py-2">
      {steps.map((step, idx) => {
        // Ширина пропорциональна кол-ву от первого шага (100%) → сужается
        const widthPct = Math.max((step.count / first) * 100, 12);

        return (
          <div key={`${step.label}-${idx}`} className="w-full flex flex-col items-center">
            {idx > 0 && (
              <div className="flex flex-col items-center my-0.5">
                <div className="w-px h-2 bg-gray-200 dark:bg-gray-700" />
                {step.conversion != null ? (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-500 dark:text-gray-300">
                    <ChevronDown size={10} />
                    {step.conversion}%
                  </div>
                ) : (
                  <ChevronDown size={12} className="text-gray-300 dark:bg-gray-600" />
                )}
                <div className="w-px h-2 bg-gray-200 dark:bg-gray-700" />
              </div>
            )}
            <div
              className="flex items-center justify-between px-4 h-11 rounded transition-all duration-500 shadow-sm"
              style={{
                width: `${widthPct}%`,
                backgroundColor: step.color,
                minWidth: '200px',
                maxWidth: '100%',
              }}
            >
              <span className="text-white text-sm font-medium truncate mr-3">{step.label}</span>
              <span className="text-white text-lg font-bold flex-shrink-0">{step.count}</span>
            </div>
          </div>
        );
      })}

      {rejected !== undefined && rejected > 0 && (
        <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-full text-sm text-red-600 dark:text-red-400">
          <span>↵</span>
          <span>Отказы: <strong>{rejected}</strong></span>
        </div>
      )}
    </div>
  );
}
