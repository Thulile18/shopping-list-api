// Shopping List API
// A simple Node.js HTTP server (no frameworks) that lets a user add,
// view, update, and delete items on a shopping list.
//
// Everything the server needs - storing items, checking incoming data,
// sending responses, and routing requests - lives in this one file,
// alongside the Item type in models/item.ts.

import * as http from "http";
import { randomUUID } from "crypto";
import { Item, CreateItemInput, UpdateItemInput } from "./models/item";

const PORT = 3000;

// ---------------------------------------------------------------
// In-memory "database"
// ---------------------------------------------------------------
// Just an array living in memory. It starts empty on purpose - every
// item on the list should come from a real POST /items request, not
// from data written into the code ahead of time. Restart the server
// and the list resets - that's expected for this project.

const items: Item[] = [];

function addItem(input: CreateItemInput): Item {
  const newItem: Item = {
    id: randomUUID(),
    name: input.name,
    quantity: input.quantity,
    purchased: false,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  return newItem;
}

function getAllItems(): Item[] {
  return items;
}

function getItemById(id: string): Item | undefined {
  return items.find((item) => item.id === id);
}

function updateItem(id: string, updates: UpdateItemInput): Item | undefined {
  const item = getItemById(id);
  if (!item) return undefined;

  if (updates.name !== undefined) item.name = updates.name;
  if (updates.quantity !== undefined) item.quantity = updates.quantity;
  if (updates.purchased !== undefined) item.purchased = updates.purchased;

  return item;
}

function deleteItem(id: string): boolean {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return false;
  items.splice(index, 1);
  return true;
}

// ---------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------
// Every response is JSON with the same shape, whether it succeeded
// or failed. Funnelling every response through these two functions
// is what makes that consistent.

function sendSuccess(res: http.ServerResponse, statusCode: number, data: unknown): void {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ success: true, data }));
}

function sendError(res: http.ServerResponse, statusCode: number, message: string): void {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ success: false, error: message }));
}

// ---------------------------------------------------------------
// Request body + validation helpers
// ---------------------------------------------------------------

function readRequestBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let rawData = "";
    req.on("data", (chunk) => (rawData += chunk));
    req.on("end", () => {
      if (!rawData) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(rawData));
      } catch {
        reject(new Error("Request body is not valid JSON"));
      }
    });
    req.on("error", (err) => reject(err));
  });
}

function validateCreateItem(body: any): string | null {
  if (!body || typeof body !== "object") {
    return "Request body must be a JSON object";
  }
  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    return "'name' is required and must be a non-empty string";
  }
  if (body.quantity === undefined || body.quantity === null || body.quantity === "") {
    return "'quantity' is required";
  }
  if (typeof body.quantity === "number") {
    if (body.quantity <= 0) {
      return "'quantity' must be greater than 0";
    }
  } else if (typeof body.quantity !== "string" || body.quantity.trim().length === 0) {
    return "'quantity' must be a non-empty string (e.g. \"2L\") or a positive number";
  }
  return null;
}

function validateUpdateItem(body: any): string | null {
  if (!body || typeof body !== "object") {
    return "Request body must be a JSON object";
  }
  if (body.name !== undefined && (typeof body.name !== "string" || body.name.trim().length === 0)) {
    return "'name' must be a non-empty string";
  }
  if (body.quantity !== undefined) {
    if (typeof body.quantity === "number") {
      if (body.quantity <= 0) return "'quantity' must be greater than 0";
    } else if (typeof body.quantity !== "string" || body.quantity.trim().length === 0) {
      return "'quantity' must be a non-empty string (e.g. \"2L\") or a positive number";
    }
  }
  if (body.purchased !== undefined && typeof body.purchased !== "boolean") {
    return "'purchased' must be true or false";
  }
  if (body.name === undefined && body.quantity === undefined && body.purchased === undefined) {
    return "Provide at least one field to update: 'name', 'quantity' or 'purchased'";
  }
  return null;
}

// ---------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------

function handleGetAllItems(res: http.ServerResponse): void {
  sendSuccess(res, 200, getAllItems());
}

function handleGetItemById(res: http.ServerResponse, id: string): void {
  const item = getItemById(id);
  if (!item) {
    sendError(res, 404, `No item found with id '${id}'`);
    return;
  }
  sendSuccess(res, 200, item);
}

async function handleCreateItem(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  try {
    const body = await readRequestBody(req);
    const validationError = validateCreateItem(body);
    if (validationError) {
      sendError(res, 400, validationError);
      return;
    }
    const newItem = addItem({
      name: body.name.trim(),
      quantity: typeof body.quantity === "string" ? body.quantity.trim() : body.quantity,
    });
    sendSuccess(res, 201, newItem);
  } catch (err) {
    sendError(res, 400, (err as Error).message);
  }
}

async function handleUpdateItem(req: http.IncomingMessage, res: http.ServerResponse, id: string): Promise<void> {
  try {
    const body = await readRequestBody(req);
    const validationError = validateUpdateItem(body);
    if (validationError) {
      sendError(res, 400, validationError);
      return;
    }
    const updates: UpdateItemInput = {};
    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.quantity !== undefined) {
      updates.quantity = typeof body.quantity === "string" ? body.quantity.trim() : body.quantity;
    }
    if (body.purchased !== undefined) updates.purchased = body.purchased;

    const updatedItem = updateItem(id, updates);
    if (!updatedItem) {
      sendError(res, 404, `No item found with id '${id}'`);
      return;
    }
    sendSuccess(res, 200, updatedItem);
  } catch (err) {
    sendError(res, 400, (err as Error).message);
  }
}

function handleDeleteItem(res: http.ServerResponse, id: string): void {
  const wasDeleted = deleteItem(id);
  if (!wasDeleted) {
    sendError(res, 404, `No item found with id '${id}'`);
    return;
  }
  res.writeHead(204);
  res.end();
}

// ---------------------------------------------------------------
// HTTP server + routing
// ---------------------------------------------------------------

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const method = req.method;
  const pathParts = url.pathname.split("/").filter(Boolean); // "/items/123" -> ["items", "123"]

  // /items
  if (pathParts[0] === "items" && pathParts.length === 1) {
    if (method === "GET") {
      handleGetAllItems(res);
      return;
    }
    if (method === "POST") {
      await handleCreateItem(req, res);
      return;
    }
  }

  // /items/:id
  if (pathParts[0] === "items" && pathParts.length === 2) {
    const id = pathParts[1];
    if (method === "GET") {
      handleGetItemById(res, id);
      return;
    }
    if (method === "PUT") {
      await handleUpdateItem(req, res, id);
      return;
    }
    if (method === "DELETE") {
      handleDeleteItem(res, id);
      return;
    }
  }

  // No route matched
  sendError(res, 404, `Cannot ${method} ${url.pathname}`);
});

server.listen(PORT, () => {
  console.log(`Shopping List API is running on http://localhost:${PORT}`);
});
