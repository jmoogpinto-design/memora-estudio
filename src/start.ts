import { createStart, createMiddleware } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Harden every response with common security headers.
// CSP is intentionally permissive enough for Vite/React SSR, inline styles,
// data: images (used by the app's photo previews), and Supabase API/Storage.
const securityHeadersMiddleware = createMiddleware().server(async ({ next }) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL ?? "";
  const supabaseOrigin = (() => {
    try {
      return supabaseUrl ? new URL(supabaseUrl).origin : "";
    } catch {
      return "";
    }
  })();
  const supabaseWs = supabaseOrigin ? supabaseOrigin.replace(/^http/, "ws") : "";

  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline' https:",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https:`,
    `connect-src 'self' https: wss: data: blob:${supabaseOrigin ? ` ${supabaseOrigin} ${supabaseWs}` : ""}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ].join("; ");

  setResponseHeader("content-security-policy", csp);
  setResponseHeader("x-frame-options", "SAMEORIGIN");
  setResponseHeader("x-content-type-options", "nosniff");
  setResponseHeader("referrer-policy", "strict-origin-when-cross-origin");
  setResponseHeader("permissions-policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
  setResponseHeader("strict-transport-security", "max-age=63072000; includeSubDomains; preload");
  setResponseHeader("x-xss-protection", "0");
  setResponseHeader("cross-origin-opener-policy", "same-origin");

  return next();
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [securityHeadersMiddleware, errorMiddleware],
}));
