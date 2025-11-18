import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, proposals, commissionConfigs, Proposal, CommissionConfig, InsertProposal, InsertCommissionConfig } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users: database not available");
    return [];
  }

  return await db.select().from(users);
}

export async function createProposal(proposal: InsertProposal): Promise<Proposal | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create proposal: database not available");
    return null;
  }

  try {
    const result = await db.insert(proposals).values(proposal);
    const proposalId = result[0].insertId;
    return await getProposalById(Number(proposalId));
  } catch (error) {
    console.error("[Database] Failed to create proposal:", error);
    throw error;
  }
}

export async function getProposalById(id: number): Promise<Proposal | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get proposal: database not available");
    return null;
  }

  const result = await db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserProposals(userId: number): Promise<Proposal[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get proposals: database not available");
    return [];
  }

  return await db.select().from(proposals).where(eq(proposals.userId, userId));
}

export async function getAllProposals(): Promise<Proposal[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get proposals: database not available");
    return [];
  }

  return await db.select().from(proposals);
}

export async function updateProposal(id: number, data: Partial<Proposal>): Promise<Proposal | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update proposal: database not available");
    return null;
  }

  try {
    await db.update(proposals).set(data).where(eq(proposals.id, id));
    return await getProposalById(id);
  } catch (error) {
    console.error("[Database] Failed to update proposal:", error);
    throw error;
  }
}

export async function deleteProposal(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete proposal: database not available");
    return false;
  }

  try {
    await db.delete(proposals).where(eq(proposals.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete proposal:", error);
    throw error;
  }
}

export async function createCommissionConfig(config: InsertCommissionConfig): Promise<CommissionConfig | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create commission config: database not available");
    return null;
  }

  try {
    const result = await db.insert(commissionConfigs).values(config);
    const configId = result[0].insertId;
    return await getCommissionConfigById(Number(configId));
  } catch (error) {
    console.error("[Database] Failed to create commission config:", error);
    throw error;
  }
}

export async function getCommissionConfigById(id: number): Promise<CommissionConfig | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get commission config: database not available");
    return null;
  }

  const result = await db.select().from(commissionConfigs).where(eq(commissionConfigs.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getCommissionConfig(userId: number, bank: string, proposalType: string): Promise<CommissionConfig | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get commission config: database not available");
    return null;
  }

  const result = await db.select().from(commissionConfigs).where(
    and(
      eq(commissionConfigs.userId, userId),
      eq(commissionConfigs.bank, bank),
      eq(commissionConfigs.proposalType, proposalType as any)
    )
  ).limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getUserCommissionConfigs(userId: number): Promise<CommissionConfig[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get commission configs: database not available");
    return [];
  }

  return await db.select().from(commissionConfigs).where(eq(commissionConfigs.userId, userId));
}

export async function getAllCommissionConfigs(): Promise<CommissionConfig[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get commission configs: database not available");
    return [];
  }

  return await db.select().from(commissionConfigs);
}

export async function updateCommissionConfig(id: number, data: Partial<CommissionConfig>): Promise<CommissionConfig | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update commission config: database not available");
    return null;
  }

  try {
    await db.update(commissionConfigs).set(data).where(eq(commissionConfigs.id, id));
    return await getCommissionConfigById(id);
  } catch (error) {
    console.error("[Database] Failed to update commission config:", error);
    throw error;
  }
}

export async function deleteCommissionConfig(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete commission config: database not available");
    return false;
  }

  try {
    await db.delete(commissionConfigs).where(eq(commissionConfigs.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete commission config:", error);
    throw error;
  }
}
