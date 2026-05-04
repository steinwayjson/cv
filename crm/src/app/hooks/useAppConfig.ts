import { useState, useCallback } from 'react';

// Только конфиг источников — scoring params переехали в Supabase (agent_configs)
export interface AppConfig {
  sources: string[];
}

const DEFAULT_CONFIG: AppConfig = {
  sources: ['HH', 'TG', 'LinkedIn', 'Сайт'],
};

const KEY = 'crm_app_config';

function load(): AppConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { sources: parsed.sources || DEFAULT_CONFIG.sources };
    }
  } catch {}
  return DEFAULT_CONFIG;
}

function save(config: AppConfig) {
  localStorage.setItem(KEY, JSON.stringify(config));
}

export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig>(load);

  const update = useCallback((patch: Partial<AppConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...patch };
      save(next);
      return next;
    });
  }, []);

  return { config, update };
}
