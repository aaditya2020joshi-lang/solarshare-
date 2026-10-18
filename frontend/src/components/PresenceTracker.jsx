import { useEffect } from 'react';
import client, { getAuthToken } from '../api/client';
import { useAuth } from '../context/AuthContext';

const PING_MS = 10000;

// Runs for any signed-in page: counts time only while the site is open and the tab is visible.
export default function PresenceTracker() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return undefined;
    let timer = null;

    const ping = () => client.post('/presence/ping').catch(() => {});
    const start = () => {
      if (timer) return;
      ping();
      timer = setInterval(ping, PING_MS);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };
    const leave = () => {
      stop();
      try {
        fetch('/api/presence/leave', {
          method: 'POST',
          keepalive: true,
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        });
      } catch {
        // best effort only
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') start();
      else leave();
    };

    if (document.visibilityState === 'visible') start();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', leave);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', leave);
      stop();
    };
  }, [user]);

  return null;
}
