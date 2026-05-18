import type { APIRoute } from "astro";

const handler: APIRoute = async ({ cookies }) => {
  cookies.delete("session", { path: "/" });
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST = handler;
export const DELETE = handler;
