import { useEffect } from 'react';
import { useSettingsStore } from '../store/settingsStore';

// Map theme value to CSS class
function getThemeClass(theme: string) {
  if (theme === 'github') return '';
  return `theme-${theme}`;
}

export function Theme({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore(s => s.settings?.theme || 'github');

  useEffect(() => {
    const className = getThemeClass(theme);
    document.body.classList.remove('theme-pastel-brown', 'theme-pastel-teal', 'theme-pastel-lavender', 'theme-pastel-sage');
    if (className) document.body.classList.add(className);
    else document.body.className = document.body.className.replace(/theme-[^ ]+/g, '').trim();
    return () => {
      if (className) document.body.classList.remove(className);
    };
  }, [theme]);

  return <>{children}</>;
}
