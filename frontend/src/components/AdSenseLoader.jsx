import { useEffect } from 'react';

const ADSENSE_CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID;

export default function AdSenseLoader() {
  useEffect(() => {
    if (!ADSENSE_CLIENT_ID || document.querySelector('script[data-adsbygoogle]')) return;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
    script.crossOrigin = 'anonymous';
    script.dataset.adsbygoogle = 'true';
    document.head.appendChild(script);
  }, []);

  return null;
}
