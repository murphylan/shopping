import { pgTable, varchar, integer, timestamp, primaryKey } from "drizzle-orm/pg-core";

export const cartItems = pgTable(
  "cart_items",
  {
    userId: varchar("user_id", { length: 64 }).notNull(),
    productId: varchar("product_id", { length: 32 }).notNull(),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.productId] })]
);
