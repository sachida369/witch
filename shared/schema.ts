import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const kundaliOrders = pgTable("kundali_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paymentId: text("payment_id").notNull().unique(),
  razorpayOrderId: text("razorpay_order_id").notNull(),
  amount: integer("amount").notNull(), // Amount in paise
  currency: text("currency").notNull().default("INR"),
  status: text("status").notNull().default("created"), // created, paid, completed, failed
  fullName: text("full_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  timeOfBirth: text("time_of_birth"),
  placeOfBirth: text("place_of_birth").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  timeUnknown: boolean("time_unknown").default(false),
  kundaliData: jsonb("kundali_data"), // Store the generated kundali
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertKundaliOrderSchema = createInsertSchema(kundaliOrders).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const kundaliFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  timeOfBirth: z.string().optional(),
  placeOfBirth: z.string().min(1, "Place of birth is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timeUnknown: z.boolean().optional(),
  paymentId: z.string().optional(),
});

export const paymentVerificationSchema = z.object({
  razorpay_payment_id: z.string(),
  razorpay_order_id: z.string(),
  razorpay_signature: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type KundaliOrder = typeof kundaliOrders.$inferSelect;
export type InsertKundaliOrder = z.infer<typeof insertKundaliOrderSchema>;
export type KundaliFormData = z.infer<typeof kundaliFormSchema>;
export type PaymentVerificationData = z.infer<typeof paymentVerificationSchema>;
