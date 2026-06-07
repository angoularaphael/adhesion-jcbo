const DEFAULT_ORIGINS = [
  "https://jcboyang-conseil.vercel.app",
  "https://jcbo-conseil.com",
  "https://www.jcbo-conseil.com",
  "https://adhesion-jcbo.vercel.app",
  "https://jcbo-conseil-diagnostic.vercel.app",
  "http://localhost:4321",
  "http://localhost:4322",
  "http://localhost:4323",
];

export function getAllowedOrigins(): string[] {
  const extra = import.meta.env.CORS_ORIGINS?.split(",").map((o: string) => o.trim()).filter(Boolean) ?? [];
  return [...new Set([...DEFAULT_ORIGINS, ...extra])];
}

export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin") ?? "";
  const allowed = getAllowedOrigins();
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
  if (allowed.includes(origin) || allowed.includes("*")) {
    headers["Access-Control-Allow-Origin"] = origin || allowed[0];
    headers["Vary"] = "Origin";
  }
  return headers;
}

export function jsonCorsResponse(
  request: Request,
  body: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(request),
      ...extraHeaders,
    },
  });
}

export function handleCorsPreflight(request: Request): Response | null {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }
  return null;
}
