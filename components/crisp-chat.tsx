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
    type CrispCommand = [string, ...unknown[]];
    const crispQueue: CrispCommand[] = Array.isArray(window.$crisp) ? window.$crisp : [];
    window.$crisp = crispQueue;

    const pushCommand = (...command: CrispCommand) => {
      window.$crisp?.push(command);
    };
    window.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID;

    const script = injectScript();

    const welcomeMessage = CONTACT_COPY.crisp.welcome;
    const offlineMessage = CONTACT_COPY.crisp.offline;

    const sessionHandler = () => {
      pushCommand("do", "message:show", ["text", welcomeMessage]);
      window.dispatchEvent(new CustomEvent("crisp:session", { detail: { status: "ready" } }));
    };

    const availabilityHandler = (availability: "online" | "offline") => {
      window.dispatchEvent(new CustomEvent("crisp:availability", { detail: { status: availability } }));
      if (availability === "offline" && !availabilityNotifiedRef.current) {
        availabilityNotifiedRef.current = true;
        if (offlineMessage) {
          const message = WHATSAPP_LINK ? `${offlineMessage} ${WHATSAPP_LINK}` : offlineMessage;
          pushCommand("do", "message:show", ["text", message]);
        }
      }
    };

    const chatOpenedHandler = () => {
      trackEvent("chat_open", {
        context_path: pathname,
      });
    };

    pushCommand("on", "session:loaded", sessionHandler);
    pushCommand("on", "website:availability:changed", availabilityHandler);
    pushCommand("on", "chat:opened", chatOpenedHandler);

    return () => {
      pushCommand("off", "session:loaded", sessionHandler);
      pushCommand("off", "website:availability:changed", availabilityHandler);
      pushCommand("off", "chat:opened", chatOpenedHandler);
      script.remove();
    };
  }, [pathname, trackEvent]);

  return null;
}
