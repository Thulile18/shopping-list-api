// This is our "database" for the assignment - just an array living
// in memory. It starts empty on purpose: every item on the list
// should come from a real POST /items request, not from data we
// typed in ourselves. That's what makes this dynamic rather than
// hardcoded - restart the server and the list is empty again.

import { randomUUID } from "crypto";
import { Item, CreateItemInput, UpdateItemInput } from "../models/item";

// The array that holds every item currently on the shopping list.
const items: Item[] = [];

// Add a brand new item to the list and return it.
export function addItem(input: CreateItemInput): Item {
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

// Return every item currently on the list.
export function getAllItems(): Item[] {
  return items;
}

// Find one item by its id. Returns undefined if it doesn't exist.
export function getItemById(id: string): Item | undefined {
  return items.find((item) => item.id === id);
}

// Update an existing item. Only the fields provided in `updates`
// are changed - everything else stays the same.
export function updateItem(id: string, updates: UpdateItemInput): Item | undefined {
  const item = getItemById(id);
  if (!item) {
    return undefined;
  }

  if (updates.name !== undefined) {
    item.name = updates.name;
  }
  if (updates.quantity !== undefined) {
    item.quantity = updates.quantity;
  }
  if (updates.purchased !== undefined) {
    item.purchased = updates.purchased;
  }

  return item;
}

// Remove an item from the list. Returns true if something was
// actually deleted, false if no item with that id existed.
export function deleteItem(id: string): boolean {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }

  items.splice(index, 1);
  return true;
}
