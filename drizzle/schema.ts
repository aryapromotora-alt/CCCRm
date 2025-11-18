import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const proposals = mysqlTable("proposals", {
  id: int("id").autoincrement().primaryKey(),
  proposalNumber: varchar("proposalNumber", { length: 100 }).notNull().unique(),
  userId: int("userId").notNull(),
  bank: varchar("bank", { length: 100 }).notNull(),
  proposalType: mysqlEnum("proposalType", [
    "novo",
    "refinanciamento",
    "portabilidade",
    "refin_portabilidade",
    "refin_carteira",
    "fgts",
    "clt",
    "outros"
  ]).notNull(),
  installments: int("installments").notNull(),
  value: int("value").notNull(),
  commission: int("commission").notNull(),
  status: mysqlEnum("status", ["ativo", "cancelado", "concluido"]).default("ativo").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = typeof proposals.$inferInsert;

export const commissionConfigs = mysqlTable("commissionConfigs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  bank: varchar("bank", { length: 100 }).notNull(),
  proposalType: mysqlEnum("proposalType", [
    "novo",
    "refinanciamento",
    "portabilidade",
    "refin_portabilidade",
    "refin_carteira",
    "fgts",
    "clt",
    "outros"
  ]).notNull(),
  commissionPercentage: int("commissionPercentage").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommissionConfig = typeof commissionConfigs.$inferSelect;
export type InsertCommissionConfig = typeof commissionConfigs.$inferInsert;

export const usersRelations = relations(users, ({ many }) => ({
  proposals: many(proposals),
  commissionConfigs: many(commissionConfigs),
}));

export const proposalsRelations = relations(proposals, ({ one }) => ({
  user: one(users, {
    fields: [proposals.userId],
    references: [users.id],
  }),
}));

export const commissionConfigsRelations = relations(commissionConfigs, ({ one }) => ({
  user: one(users, {
    fields: [commissionConfigs.userId],
    references: [users.id],
  }),
}));
