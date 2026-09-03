import { IncomingMessage, ServerResponse } from "http";
import * as store from "../data/store";
import { sendSuccess, sendError } from "../utils/response";
import {
  readRequestBody,
  validateCreateItem,
  validateUpdateItem,
  toCreateItemInput,
  toUpdateItemInput,
} from "../utils/validate";

// GET /items
export function handleGetAllItems(_req: IncomingMessage, res: ServerResponse): void {
  const items = store.getAllItems();
  sendSuccess(res, 200, items);
}

// GET /items/:id
export function handleGetItemById(res: ServerResponse, id: string): void {
  const item = store.getItemById(id);

  if (!item) {
    sendError(res, 404, `No item found with id '${id}'`);
    return;
  }

  sendSuccess(res, 200, item);
}

// POST /items
export async function handleCreateItem(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const body = await readRequestBody(req);
    const validationError = validateCreateItem(body);

    if (validationError) {
      sendError(res, 400, validationError);
      return;
    }

    const newItem = store.addItem(toCreateItemInput(body));
    sendSuccess(res, 201, newItem);
  } catch (err) {
    sendError(res, 400, (err as Error).message);
  }
}

// PUT /items/:id
export async function handleUpdateItem(req: IncomingMessage, res: ServerResponse, id: string): Promise<void> {
  try {
    const body = await readRequestBody(req);
    const validationError = validateUpdateItem(body);

    if (validationError) {
      sendError(res, 400, validationError);
      return;
    }

    const updatedItem = store.updateItem(id, toUpdateItemInput(body));

    if (!updatedItem) {
      sendError(res, 404, `No item found with id '${id}'`);
      return;
    }

    sendSuccess(res, 200, updatedItem);
  } catch (err) {
    sendError(res, 400, (err as Error).message);
  }
}

// DELETE /items/:id
export function handleDeleteItem(res: ServerResponse, id: string): void {
  const wasDeleted = store.deleteItem(id);

  if (!wasDeleted) {
    sendError(res, 404, `No item found with id '${id}'`);
    return;
  }

  // 204 No Content means "it worked, and there's nothing to send back"
  res.writeHead(204);
  res.end();
}
