export {};

type CrispCommand = [string, ...unknown[]];

type FbqCommand =
  | ['init', string, Record<string, unknown>?]
  | ['consent', 'grant' | 'revoke']
  | ['track', string, Record<string, unknown>?, { eventID: string }?]
  | ['trackCustom', string, Record<string, unknown>?, { eventID: string }?];

type FacebookPixel = ((...args: FbqCommand) => void) & {
  callMethod?: (...args: FbqCommand) => void;
  queue?: FbqCommand[];
  loaded?: boolean;
  push?: FacebookPixel;
  version?: string;
};

type ConsentSettings = {
  analytics_storage?: 'granted' | 'denied';
  ad_storage?: 'granted' | 'denied';
  ad_user_data?: 'granted' | 'denied';
  ad_personalization?: 'granted' | 'denied';
  wait_for_update?: number;
};

type GtagArgs =
  | ['js', Date]
  | ['config', string, ({ send_page_view: false } | Record<string, unknown>)?]
  | ['event', string, Record<string, unknown>?]
  | ['consent', 'default', ConsentSettings]
  | ['consent', 'update', ConsentSettings]
  | ['get', string, 'client_id' | 'session_id', (value: unknown) => void];

type GtagFunction = (...args: GtagArgs) => void;

declare global {
  interface Window {
    $crisp?: CrispCommand[];
    CRISP_WEBSITE_ID?: string;
    _fbq?: FacebookPixel;
    fbq?: FacebookPixel;
    dataLayer?: unknown[];
    gtag?: GtagFunction;
  }
}
