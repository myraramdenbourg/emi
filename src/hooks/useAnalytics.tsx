import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

export const useAnalytics = () => {
  useEffect(() => {
    // Track page view
    trackEvent('page_view', {
      path: window.location.pathname,
      referrer: document.referrer
    });
  }, []);

  return { trackEvent };
};
