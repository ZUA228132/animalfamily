import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * Hook to interact with the Telegram WebApp interface.  It exposes
 * basic information about the current user (if available) and
 * applies the Telegram theme to CSS variables.  When a user
 * identity is present the hook also attempts to upsert the user
 * record into the Supabase public.users table.
 */
export interface TelegramUser {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export default function useTelegram() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const anyWin = window as any;
    const tg = anyWin?.Telegram?.WebApp;
    if (!tg) return;
    try {
      // Signal to Telegram that the app is ready
      tg.ready();
      const initUser: TelegramUser | undefined = tg?.initDataUnsafe?.user;
      if (initUser) {
        setUser(initUser);
        // Upsert the user into Supabase if we have an id.  This call
        // silently fails if the table definition isn't present or the
        // network is unavailable.
        (async () => {
          try {
            const { id, first_name, last_name, username, photo_url } = initUser;
            if (!id) return;
            const payload: any = {
              id: id.toString(),
              username,
              full_name: [first_name, last_name].filter(Boolean).join(' '),
              telegram_handle: username,
              avatar_url: photo_url,
            };
            await supabase.from('users').upsert(payload, { onConflict: 'id' });
          } catch (err) {
            console.warn('Unable to sync Telegram user with Supabase', err);
          }
        })();
      }
      // Apply Telegram theme parameters to CSS variables.  This will
      // override our pastel palette when the host Telegram app has a
      // different colour scheme (e.g. dark mode).
      const theme = tg?.themeParams || {};
      const root = document.documentElement;
      const applyIf = (prop: string, varName: string) => {
        if (theme[prop]) root.style.setProperty(varName, `#${theme[prop]}`);
      };
      applyIf('bg_color', '--color-bg');
      applyIf('secondary_bg_color', '--color-card');
      applyIf('button_color', '--color-primary');
      applyIf('button_text_color', '--color-text');
      applyIf('hint_color', '--color-secondary');
    } catch (err) {
      console.warn('Telegram integration failed', err);
    }
  }, []);
  return { user };
}