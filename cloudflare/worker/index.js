// hylove-demo Worker: serves the React SPA from static assets and proxies /api/* to the
// Access-protected origin (hylove-origin.good-nas.cc -> home-server tunnel -> nginx :8080).
// Static requests never reach this code (run_worker_first: ["/api/*"]).
const ORIGIN = "https://hylove-origin.good-nas.cc";

// Hop-by-hop / edge headers we must not forward to the origin.
const DROP_REQ = new Set([
  "host", "connection", "keep-alive", "proxy-connection", "transfer-encoding", "upgrade",
  "te", "trailer", "cf-access-client-id", "cf-access-client-secret",
  "cf-access-jwt-assertion", "cf-access-authenticated-user-email",
]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    const target = ORIGIN + url.pathname + url.search;
    const headers = new Headers();
    for (const [k, v] of request.headers) {
      const key = k.toLowerCase();
      if (DROP_REQ.has(key) || key.startsWith("cf-")) continue;
      headers.set(k, v);
    }
    // Forward app cookies but never the viewer's Access session cookie.
    const cookie = (request.headers.get("cookie") || "")
      .split(/;\s*/).filter((c) => c && !c.startsWith("CF_Authorization=")).join("; ");
    if (cookie) headers.set("cookie", cookie); else headers.delete("cookie");
    headers.set("CF-Access-Client-Id", env.CF_ACCESS_CLIENT_ID);
    headers.set("CF-Access-Client-Secret", env.CF_ACCESS_CLIENT_SECRET);
    headers.set("X-Forwarded-Host", url.host);
    headers.set("X-Forwarded-Proto", "https");
    const ip = request.headers.get("cf-connecting-ip");
    if (ip) headers.set("X-Forwarded-For", ip);

    const hasBody = !["GET", "HEAD"].includes(request.method);
    let resp;
    try {
      resp = await fetch(target, {
        method: request.method,
        headers,
        body: hasBody ? request.body : undefined,
        redirect: "manual",
        cache: "no-store",
      });
    } catch (err) {
      return json(502, { error: "origin_unreachable", detail: String(err) });
    }

    // Access rejected the service token: never leak the login redirect to the browser.
    const loc = resp.headers.get("location") || "";
    if (loc.includes("cloudflareaccess.com")) {
      return json(502, { error: "origin_auth_failed" });
    }

    // Stream the origin response back unchanged (status incl. 206, Content-Range, Content-Type...).
    const out = new Headers();
    for (const [k, v] of resp.headers) {
      if (k.toLowerCase() === "set-cookie") continue;
      out.append(k, v);
    }
    // Re-add origin Set-Cookie headers except Access' own CF_Authorization (it would clobber
    // the viewer's staging/production Access session cookie).
    for (const c of resp.headers.getSetCookie ? resp.headers.getSetCookie() : []) {
      if (!c.startsWith("CF_Authorization=")) out.append("set-cookie", c);
    }
    return new Response(resp.body, { status: resp.status, statusText: resp.statusText, headers: out });
  },
};

function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
