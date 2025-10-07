"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { useAnalytics } from "@/components/analytics-provider";
import { CONTACT_COPY, CONTACT_CHANNELS } from "@/lib/config/contact";

const CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
const WHATSAPP_LINK = CONTACT_CHANNELS.find((channel) => channel.id === "whatsapp")?.href;

function injectScript(): HTMLScriptElement {
  const script = document.createElement("script");
  script.src = "https://client.crisp.chat/l.js";
  script.async = true;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
  return script;
}

export function CrispChat() {
  const loadedRef = useRef(false);
  const availabilityNotifiedRef = useRef(false);
  const { trackEvent } = useAnalytics();
  const pathname = usePathname();

  useEffect(() => {
    if (!CRISP_WEBSITE_ID) {
      return;
    }

    if (loadedRef.current) {
      return;
    }

    loadedRef.current = true;

    type CrispCommand = [string, ...unknown[]];
    const queue: CrispCommand[] = Array.isArray(window.$crisp) ? window.$crisp : [];
    window.$crisp = queue;
    window.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID;

    const script = injectScript();

    const welcomeMessage = CONTACT_COPY.crisp.welcome;
    const offlineMessage = CONTACT_COPY.crisp.offline;

    const sessionHandler = () => {
      window.$crisp.push(["do", "message:show", ["text", welcomeMessage]]);
      window.dispatchEvent(new CustomEvent("crisp:session", { detail: { status: "ready" } }));
    };

    const availabilityHandler = (availability: "online" | "offline") => {
      window.dispatchEvent(new CustomEvent("crisp:availability", { detail: { status: availability } }));
      if (availability === "offline" && !availabilityNotifiedRef.current) {
        availabilityNotifiedRef.current = true;
        if (offlineMessage) {
          const message = WHATSAPP_LINK ? `${offlineMessage} ${WHATSAPP_LINK}` : offlineMessage;
          window.$crisp.push(["do", "message:show", ["text", message]]);
        }
      }
    };

    const chatOpenedHandler = () => {
      trackEvent("chat_open", {
        context_path: pathname,
      });
    };

    window.$crisp.push(["on", "session:loaded", sessionHandler]);
    window.$crisp.push(["on", "website:availability:changed", availabilityHandler]);
    window.$crisp.push(["on", "chat:opened", chatOpenedHandler]);

    return () => {
      window.$crisp.push(["off", "session:loaded", sessionHandler]);
      window.$crisp.push(["off", "website:availability:changed", availabilityHandler]);
      window.$crisp.push(["off", "chat:opened", chatOpenedHandler]);
      script.remove();
    };
  }, [pathname, trackEvent]);

  return null;
}
