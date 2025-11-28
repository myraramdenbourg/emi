import { supabase } from "@/integrations/supabase/client";

// Generate a session ID for tracking
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

export const trackEvent = async (
  eventType: string,
  eventData?: Record<string, any>,
  puzzleIndex?: number,
  puzzleTitle?: string
) => {
  try {
    await supabase.from('analytics_events').insert({
      event_type: eventType,
      event_data: eventData || null,
      puzzle_index: puzzleIndex,
      puzzle_title: puzzleTitle,
      session_id: getSessionId(),
      user_agent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};
