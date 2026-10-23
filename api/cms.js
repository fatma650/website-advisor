import handler from '../server/vercel-handler.mjs';

// Vercel Web Handlers use named HTTP method exports.
// The underlying handler already performs method/path routing, authentication,
// security headers, database access, and returns a standard Response.
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;
