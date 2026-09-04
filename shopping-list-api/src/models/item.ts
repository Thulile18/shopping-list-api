// This file defines what a "shopping list item" looks like.
// Using an interface means TypeScript will warn us if we ever
// try to create or update an item with the wrong shape of data.

export interface Item {
  id: string;
  name: string;
  quantity: string | number; // e.g. "2L", "12 pack", or a plain count like 3
  purchased: boolean;
  createdAt: string;
}

// When a user creates a new item, they only need to send us
// a name and a quantity - we generate the id, purchased status
// and createdAt ourselves. This type describes that smaller shape.
export interface CreateItemInput {
  name: string;
  quantity: string | number;
}

// When updating an item, every field is optional because the user
// might only want to change the quantity, or only the purchased
// status, without having to resend everything.
export interface UpdateItemInput {
  name?: string;
  quantity?: string | number;
  purchased?: boolean;
}

