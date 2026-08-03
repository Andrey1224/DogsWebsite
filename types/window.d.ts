export {};

type CrispCommand = [string, ...unknown[]];

type FbqCommand =
  | ['init', string, Record<string, unknown>?]
  | ['consent', 'grant' | 'revoke']
  | ['track', string, Record<string, unknown>?, { eventID: string }?]
  | ['trackCustom', string, Record<string, unknown>?];

type FacebookPixel = ((...args: FbqCommand) => void) & {
  callMethod?: (...args: FbqCommand) => void;
  queue?: FbqCommand[];
  loaded?: boolean;
  push?: FacebookPixel;
  version?: string;
};

type GtagArgs =
  | ['js', Date]
  | ['config', string, Record<string, unknown>?]
  | ['event', string, Record<string, unknown>?]
  | ['consent', 'update', Record<string, string>]
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
