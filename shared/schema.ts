import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  category: text("category").notNull(),
  currentStock: integer("current_stock").notNull().default(0),
  minStock: integer("min_stock").notNull().default(0),
  maxStock: integer("max_stock").notNull().default(1000),
  unit: text("unit").notNull().default("個"),
  location: text("location").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const inventoryTransactions = pgTable("inventory_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id).notNull(),
  type: text("type").notNull(), // 'inbound', 'outbound', 'adjustment'
  quantity: integer("quantity").notNull(),
  previousStock: integer("previous_stock").notNull(),
  newStock: integer("new_stock").notNull(),
  orderId: text("order_id"),
  userId: text("user_id").notNull(),
  note: text("note"),
  timestamp: timestamp("timestamp").defaultNow(),
  isVoiceCommand: integer("is_voice_command").default(0), // 0 = false, 1 = true
});

export const voiceCommands = pgTable("voice_commands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transcript: text("transcript").notNull(),
  interpretation: jsonb("interpretation"),
  successful: integer("successful").notNull().default(0), // 0 = false, 1 = true
  userId: text("user_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const dailyKpis = pgTable("daily_kpis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(), // YYYY-MM-DD format
  totalInbound: integer("total_inbound").notNull().default(0),
  totalOutbound: integer("total_outbound").notNull().default(0),
  lowStockAlerts: integer("low_stock_alerts").notNull().default(0),
  voiceCommandsUsed: integer("voice_commands_used").notNull().default(0),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  lastUpdated: true,
});

export const insertTransactionSchema = createInsertSchema(inventoryTransactions).omit({
  id: true,
  timestamp: true,
});

export const insertVoiceCommandSchema = createInsertSchema(voiceCommands).omit({
  id: true,
  timestamp: true,
});

export const insertDailyKpiSchema = createInsertSchema(dailyKpis).omit({
  id: true,
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type InsertInventoryTransaction = z.infer<typeof insertTransactionSchema>;
export type VoiceCommand = typeof voiceCommands.$inferSelect;
export type InsertVoiceCommand = z.infer<typeof insertVoiceCommandSchema>;
export type DailyKpi = typeof dailyKpis.$inferSelect;
export type InsertDailyKpi = z.infer<typeof insertDailyKpiSchema>;
