// The brief asks for every response to be JSON with a consistent
// shape. Instead of writing res.writeHead / res.end everywhere with
// slightly different formatting each time, we funnel every response
// through these two small helpers.

import { ServerResponse } from "http";

// Used for anything that worked (200, 201, 204...).
export function sendSuccess(res: ServerResponse, statusCode: number, data: unknown): void {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ success: true, data }));
}

// Used for anything that went wrong (400, 404...).
export function sendError(res: ServerResponse, statusCode: number, message: string): void {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ success: false, error: message }));
}
