import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admins can access this' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  proposals: router({
    create: protectedProcedure
      .input(z.object({
        proposalNumber: z.string().min(1),
        bank: z.string().min(1),
        proposalType: z.enum(["novo", "refinanciamento", "portabilidade", "refin_portabilidade", "refin_carteira", "fgts", "clt", "outros"]),
        installments: z.number().int().positive(),
        value: z.number().int().positive(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const commissionConfig = await db.getCommissionConfig(
            ctx.user.id,
            input.bank,
            input.proposalType
          );

          let commission = 0;
          if (commissionConfig) {
            commission = Math.round((input.value * commissionConfig.commissionPercentage) / 10000);
          }

          const proposal = await db.createProposal({
            proposalNumber: input.proposalNumber,
            userId: ctx.user.id,
            bank: input.bank,
            proposalType: input.proposalType as any,
            installments: input.installments,
            value: input.value,
            commission,
            notes: input.notes,
          });

          return proposal;
        } catch (error) {
          console.error("Error creating proposal:", error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create proposal' });
        }
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      try {
        if (ctx.user.role === 'admin') {
          return await db.getAllProposals();
        } else {
          return await db.getUserProposals(ctx.user.id);
        }
      } catch (error) {
        console.error("Error listing proposals:", error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to list proposals' });
      }
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .query(async ({ ctx, input }) => {
        try {
          const proposal = await db.getProposalById(input.id);
          if (!proposal) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' });
          }

          if (ctx.user.role !== 'admin' && proposal.userId !== ctx.user.id) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this proposal' });
          }

          return proposal;
        } catch (error) {
          console.error("Error getting proposal:", error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to get proposal' });
        }
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number().int(),
        proposalNumber: z.string().min(1).optional(),
        bank: z.string().min(1).optional(),
        proposalType: z.enum(["novo", "refinanciamento", "portabilidade", "refin_portabilidade", "refin_carteira", "fgts", "clt", "outros"]).optional(),
        installments: z.number().int().positive().optional(),
        value: z.number().int().positive().optional(),
        status: z.enum(["ativo", "cancelado", "concluido"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const proposal = await db.getProposalById(input.id);
          if (!proposal) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' });
          }

          if (ctx.user.role !== 'admin' && proposal.userId !== ctx.user.id) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this proposal' });
          }

          let updateData: any = { ...input };
          delete updateData.id;

          if (input.value || input.bank || input.proposalType) {
            const bank = input.bank || proposal.bank;
            const proposalType = input.proposalType || proposal.proposalType;
            const value = input.value || proposal.value;

            const commissionConfig = await db.getCommissionConfig(proposal.userId, bank, proposalType);
            if (commissionConfig) {
              updateData.commission = Math.round((value * commissionConfig.commissionPercentage) / 10000);
            }
          }

          const updated = await db.updateProposal(input.id, updateData);
          return updated;
        } catch (error) {
          console.error("Error updating proposal:", error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update proposal' });
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const proposal = await db.getProposalById(input.id);
          if (!proposal) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' });
          }

          if (ctx.user.role !== 'admin' && proposal.userId !== ctx.user.id) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this proposal' });
          }

          await db.deleteProposal(input.id);
          return { success: true };
        } catch (error) {
          console.error("Error deleting proposal:", error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete proposal' });
        }
      }),
  }),

  commissions: router({
    create: adminProcedure
      .input(z.object({
        userId: z.number().int(),
        bank: z.string().min(1),
        proposalType: z.enum(["novo", "refinanciamento", "portabilidade", "refin_portabilidade", "refin_carteira", "fgts", "clt", "outros"]),
        commissionPercentage: z.number().int().positive(),
      }))
      .mutation(async ({ input }) => {
        try {
          const config = await db.createCommissionConfig({
            userId: input.userId,
            bank: input.bank,
            proposalType: input.proposalType as any,
            commissionPercentage: input.commissionPercentage,
          });
          return config;
        } catch (error) {
          console.error("Error creating commission config:", error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create commission config' });
        }
      }),

    listByUser: adminProcedure
      .input(z.object({ userId: z.number().int() }))
      .query(async ({ input }) => {
        try {
          return await db.getUserCommissionConfigs(input.userId);
        } catch (error) {
          console.error("Error listing commission configs:", error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to list commission configs' });
        }
      }),

    listAll: adminProcedure.query(async () => {
      try {
        return await db.getAllCommissionConfigs();
      } catch (error) {
        console.error("Error listing all commission configs:", error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to list commission configs' });
      }
    }),

    update: adminProcedure
      .input(z.object({
        id: z.number().int(),
        commissionPercentage: z.number().int().positive(),
      }))
      .mutation(async ({ input }) => {
        try {
          const config = await db.updateCommissionConfig(input.id, {
            commissionPercentage: input.commissionPercentage,
          });
          return config;
        } catch (error) {
          console.error("Error updating commission config:", error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update commission config' });
        }
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        try {
          await db.deleteCommissionConfig(input.id);
          return { success: true };
        } catch (error) {
          console.error("Error deleting commission config:", error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete commission config' });
        }
      }),
  }),

  users: router({
    list: adminProcedure.query(async () => {
      try {
        return await db.getAllUsers();
      } catch (error) {
        console.error("Error listing users:", error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to list users' });
      }
    }),

    get: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .query(async ({ input }) => {
        try {
          const user = await db.getUserById(input.id);
          if (!user) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
          }
          return user;
        } catch (error) {
          console.error("Error getting user:", error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to get user' });
        }
      }),

    updateRole: adminProcedure
      .input(z.object({
        id: z.number().int(),
        role: z.enum(["user", "admin"]),
      }))
      .mutation(async ({ input }) => {
        try {
          const user = await db.updateProposal(input.id, { role: input.role } as any);
          return user;
        } catch (error) {
          console.error("Error updating user role:", error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update user role' });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
