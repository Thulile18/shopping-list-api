# Shopping List API

A simple REST API for managing a shopping list, built with **Node.js** and **TypeScript** using only Node's built-in `http` module (no Express or other frameworks). Items are stored **in memory**, so the list resets whenever the server restarts.

## Project structure

```
shopping-list-api/
├── src/
│   ├── models/
│   │   └── item.ts        # Item, CreateItemInput, UpdateItemInput types
│   ├── data/
│   │   └── store.ts        # In-memory array + CRUD helper functions
│   ├── utils/
│   │   ├── response.ts     # sendSuccess / sendError JSON response helpers
│   │   └── validate.ts     # Request body parsing + validation
│   ├── routes/
│   │   └── items.ts        # Route handler logic for each endpoint
│   └── server.ts           # HTTP server + routing
├── package.json
├── tsconfig.json
└── README.md
```

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run in development mode (auto-restarts on file changes):
   ```bash
   npm run dev
   ```

   Or build and run the compiled JavaScript:
   ```bash
   npm run build
   npm start
   ```

3. The server starts on **http://localhost:3000**.

## Response format

Every response is JSON and follows one of these two shapes:

Success:
```json
{ "success": true, "data": { ... } }
```

Error:
```json
{ "success": false, "error": "explanation of what went wrong" }
```

## Endpoints

### Add an item
`POST /items`

Body:
```json
{ "name": "Milk", "quantity": "2L" }
```

`quantity` can be a number (`3`) or a descriptive string (`"2L"`, `"12 pack"`) — whatever makes sense for that item.

Returns `201` with the created item (id, purchased, createdAt are generated automatically).
Returns `400` if `name` is missing/empty, or `quantity` is missing, empty, or (when a number) not greater than 0.

### Get all items
`GET /items`

Returns `200` with an array of every item currently on the list.

### Get a single item
`GET /items/:id`

Returns `200` with the item, or `404` if no item has that id.

### Update an item
`PUT /items/:id`

Body (any combination of these fields):
```json
{ "quantity": 2, "purchased": true }
```

Use this to change the quantity (e.g. "2L of milk instead of 1"), rename an item, or check it off as purchased. Returns `200` with the updated item, `400` if the body is invalid or empty, or `404` if the id doesn't exist.

### Delete an item
`DELETE /items/:id`

Returns `204 No Content` if deleted, or `404` if no item has that id.

## Testing with Postman

1. Start the server (`npm run dev`).
2. In Postman, create requests for each endpoint above, pointing at `http://localhost:3000/items` (add `/:id` where needed).
3. For POST and PUT requests, set the body type to `raw` → `JSON` in Postman and include the fields shown above.
4. Try a few error cases too — e.g. POST with no `name`, or GET/DELETE with a made-up id — to confirm the 400/404 responses work.

## Notes

- Data is **not** persisted anywhere — it's just a JavaScript array in `src/data/store.ts`, so it resets every time the server restarts. That's expected for this project.
- IDs are generated with Node's built-in `crypto.randomUUID()`, so no extra packages were needed for that.
