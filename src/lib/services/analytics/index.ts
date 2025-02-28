// Analytics service abstraction
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

export interface AnalyticsService {
  initialize(): void;
  trackEvent(event: AnalyticsEvent): void;
  trackPageView(url: string): void;
}
