import * as http from "http";
import { sendError } from "./utils/response";
import {
  handleGetAllItems,
  handleGetItemById,
  handleCreateItem,
  handleUpdateItem,
  handleDeleteItem,
} from "./routes/items";

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  // req.url can technically be undefined, so we fall back to "/"
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const method = req.method;
  const pathParts = url.pathname.split("/").filter(Boolean); // e.g. ["items", "123"]

  // ----- /items -----
  if (pathParts[0] === "items" && pathParts.length === 1) {
    if (method === "GET") {
      handleGetAllItems(req, res);
      return;
    }
    if (method === "POST") {
      await handleCreateItem(req, res);
      return;
    }
  }

  // ----- /items/:id -----
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

  // If nothing above matched, the route simply doesn't exist.
  sendError(res, 404, `Cannot ${method} ${url.pathname}`);
});

server.listen(PORT, () => {
  console.log(`Shopping List API is running on http://localhost:${PORT}`);
});
