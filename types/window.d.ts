export {};

type CrispCommand = [string, ...unknown[]];

type FbqCommand =
  | ["init", string, Record<string, unknown>?]
  | ["consent", "grant" | "revoke"]
  | ["track", string, Record<string, unknown>?]
  | ["trackCustom", string, Record<string, unknown>?];

type FacebookPixel = ((...args: FbqCommand) => void) & {
  queue?: FbqCommand[];
  loaded?: boolean;
  version?: string;
};

type GtagArgs =
  | ["js", Date]
  | ["config", string, Record<string, unknown>?]
  | ["event", string, Record<string, unknown>?]
  | ["consent", "update", Record<string, string>];

type GtagFunction = (...args: GtagArgs) => void;

declare global {
  interface Window {
    $crisp?: CrispCommand[];
    CRISP_WEBSITE_ID?: string;
    fbq?: FacebookPixel;
    dataLayer?: unknown[];
    gtag?: GtagFunction;
  }
}
