import { IncomingMessage } from "http";
import { CreateItemInput, UpdateItemInput } from "../models/item";

// Node's raw http server doesn't parse the request body for us the
// way Express would. This function listens for the incoming data
// chunks, joins them together, and parses the result as JSON.
export function readRequestBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let rawData = "";

    req.on("data", (chunk) => {
      rawData += chunk;
    });

    req.on("end", () => {
      if (!rawData) {
        // No body was sent at all (e.g. an empty POST request).
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(rawData));
      } catch (err) {
        reject(new Error("Request body is not valid JSON"));
      }
    });

    req.on("error", (err) => reject(err));
  });
}

// Checks the body sent to POST /items. Returns an error message
// if something is missing or the wrong type, or null if it's fine.
export function validateCreateItem(body: any): string | null {
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

// Checks the body sent to PUT /items/:id. Every field is optional,
// but whatever IS sent has to be the right type.
export function validateUpdateItem(body: any): string | null {
  if (!body || typeof body !== "object") {
    return "Request body must be a JSON object";
  }
  if (body.name !== undefined && (typeof body.name !== "string" || body.name.trim().length === 0)) {
    return "'name' must be a non-empty string";
  }
  if (body.quantity !== undefined) {
    if (typeof body.quantity === "number") {
      if (body.quantity <= 0) {
        return "'quantity' must be greater than 0";
      }
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

export function toCreateItemInput(body: any): CreateItemInput {
  return {
    name: body.name.trim(),
    quantity: typeof body.quantity === "string" ? body.quantity.trim() : body.quantity,
  };
}

export function toUpdateItemInput(body: any): UpdateItemInput {
  const updates: UpdateItemInput = {};
  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.quantity !== undefined) {
    updates.quantity = typeof body.quantity === "string" ? body.quantity.trim() : body.quantity;
  }
  if (body.purchased !== undefined) updates.purchased = body.purchased;
  return updates;
}
