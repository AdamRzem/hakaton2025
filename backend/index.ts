import { TRPCError } from "@trpc/server";
import * as trpcExpress from '@trpc/server/adapters/express';
import argon from "argon2";
import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "./db";
import { publicProcedure, router } from './trpc';

const SUPER_SECRET_KEY = "testing" as const;
const API_KEY = "testing123" as const;
const appRouter = router({
    register: publicProcedure.input(z.object({ email: z.email(), password: z.string() })).mutation(async (opts) => {
        const hash = await argon.hash(opts.input.password)
        console.log(opts.input, hash);
        const res = await db.user.create({ data: { email: opts.input.email, password: hash, reputation: 0 } });
        console.log(res);
        return jwt.sign(res.userId, SUPER_SECRET_KEY)

    }),
    login: publicProcedure.input(z.object({ email: z.email(), password: z.string() })).query(async (opts) => {
        const user = await db.user.findUnique({ where: { email: opts.input.email } });
        if (!user) {
            return false;
        }
        const isValid = await argon.verify(user.password, opts.input.password)
        if (!isValid) {
            return false;
        }
        return jwt.sign(user.userId, SUPER_SECRET_KEY)


    }),
    report: publicProcedure.input(z.object({ toke: z.string(), location: z.string(), date: z.string(), lineNumber: z.number().optional(), description: z.string() })).mutation(async (opts) => {
        let userId = "";
        try {
            const out = jwt.verify(opts.input.toke, SUPER_SECRET_KEY);
            if (typeof out !== "string") {
                throw new TRPCError({ message: "not authorized", code: "FORBIDDEN" });
            }
            else {
                userId = out;
            }
        }
        catch {
            throw new TRPCError({ message: "not authorized", code: "FORBIDDEN" });

        }

        await db.report.create({ data: { location: opts.input.location, userId: userId, date: opts.input.date, lineNumber: opts.input.lineNumber, description: opts.input.description }, });
    }),
    getReports: publicProcedure.input(z.object({ toke: z.string().optional() }).optional()).query(async (opts) => {
        let userId: string | null = null;
        if (opts.input?.toke) {
            try {
                const out = jwt.verify(opts.input.toke, SUPER_SECRET_KEY);
                if (typeof out === "string") userId = out;
            } catch {
                // ignore invalid token for public listing
            }
        }
        const reports = await db.report.findMany({
            include: {
                user: true,
                _count: { select: { upvotes: true, downvotes: true } },
                ...(userId ? { upvotes: { where: { userId }, select: { upvotedId: true } }, downvotes: { where: { userId }, select: { downvotedId: true } } } : {}),
            },
            orderBy: { createdAt: 'desc' }
        });
        return reports.map(r => {
            const { _count, upvotes, downvotes, ...rest } = r as typeof r & { _count: { upvotes: number; downvotes: number }; upvotes?: any[]; downvotes?: any[] };
            const score = _count.upvotes - _count.downvotes;
            let userVote: 'up' | 'down' | null = null;
            if (userId) {
                if (upvotes && upvotes.length > 0) userVote = 'up';
                else if (downvotes && downvotes.length > 0) userVote = 'down';
            }
            return { ...rest, score, userVote };
        });
    }),
    upvote: publicProcedure.input(z.object({ toke: z.string(), reportId: z.string() })).mutation(async (opts) => {
        let userId = "";
        try {
            const out = jwt.verify(opts.input.toke, SUPER_SECRET_KEY);
            if (typeof out !== "string") {
                throw new TRPCError({ message: "not authorized", code: "FORBIDDEN" });
            }
            userId = out;
        } catch {
            throw new TRPCError({ message: "not authorized", code: "FORBIDDEN" });
        }
        const reportId = opts.input.reportId;
        const existingUp = await db.upvoted.findUnique({ where: { userId_reportId: { userId, reportId } } }).catch(() => null);
        const existingDown = await db.downvoted.findUnique({ where: { userId_reportId: { userId, reportId } } }).catch(() => null);
        let status: 'removed' | 'upvoted' | 'switched' = 'removed';
        await db.$transaction(async (tx) => {
            if (existingUp) {
                await tx.upvoted.delete({ where: { userId_reportId: { userId, reportId } } });
                status = 'removed';
            } else {
                if (existingDown) {
                    await tx.downvoted.delete({ where: { userId_reportId: { userId, reportId } } });
                    status = 'switched';
                } else {
                    status = 'upvoted';
                }
                await tx.upvoted.create({ data: { userId, reportId } });
            }
        });
        const [upCount, downCount] = await Promise.all([
            db.upvoted.count({ where: { reportId } }),
            db.downvoted.count({ where: { reportId } })
        ]);
        const score = upCount - downCount;
        const userVote = status === 'removed' ? null : 'up';
        return { status, score, userVote };
    }),
    downovote: publicProcedure.input(z.object({ toke: z.string(), reportId: z.string() })).mutation(async (opts) => {
        let userId = "";
        try {
            const out = jwt.verify(opts.input.toke, SUPER_SECRET_KEY);
            if (typeof out !== "string") {
                throw new TRPCError({ message: "not authorized", code: "FORBIDDEN" });
            }
            userId = out;
        } catch {
            throw new TRPCError({ message: "not authorized", code: "FORBIDDEN" });
        }
        const reportId = opts.input.reportId;
        const existingDown = await db.downvoted.findUnique({ where: { userId_reportId: { userId, reportId } } }).catch(() => null);
        const existingUp = await db.upvoted.findUnique({ where: { userId_reportId: { userId, reportId } } }).catch(() => null);
        let status: 'removed' | 'downvoted' | 'switched' = 'removed';
        await db.$transaction(async (tx) => {
            if (existingDown) {
                await tx.downvoted.delete({ where: { userId_reportId: { userId, reportId } } });
                status = 'removed';
            } else {
                if (existingUp) {
                    await tx.upvoted.delete({ where: { userId_reportId: { userId, reportId } } });
                    status = 'switched';
                } else {
                    status = 'downvoted';
                }
                await tx.downvoted.create({ data: { userId, reportId } });
            }
        });
        const [upCount, downCount] = await Promise.all([
            db.upvoted.count({ where: { reportId } }),
            db.downvoted.count({ where: { reportId } })
        ]);
        const score = upCount - downCount;
        const userVote = status === 'removed' ? null : 'down';
        return { status, score, userVote };
    }),
    userInfo: publicProcedure.input(z.object({ toke: z.string() })).query(async (opts) => {
        let userId = "";
        try {
            const out = jwt.verify(opts.input.toke, SUPER_SECRET_KEY);
            if (typeof out !== "string") {
                throw new TRPCError({ message: "not authorized", code: "FORBIDDEN" });
            }
            else {
                userId = out;
            }
        }
        catch {
            throw new TRPCError({ message: "not authorized", code: "FORBIDDEN" });

        }
        const user = await db.user.findUnique({ where: { userId }, include: { reports: true } });
        let score = 0;
        if (user) {
            const [upCount, downCount] = await Promise.all([
                db.upvoted.count({ where: { report: { userId } } }),
                db.downvoted.count({ where: { report: { userId } } }),
            ]);
            score = upCount - downCount;
        }
        if (!user) {
            throw new TRPCError({ message: "not authorized", code: "FORBIDDEN" });
        }
        return { ...user, score };
    }),


});

const app = express();
app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
        router: appRouter,
    }),
);
app.post("/api/v1/addDelay", express.json(), async (req, res) => {
    const apiKey = req.headers["x-api-key"];
    if (apiKey !== API_KEY) {
        res.status(403).json({ error: "Forbidden" });
        return;
    }
    const body = z.object({ lineNumber: z.number(), delayMinutes: z.number(), reason: z.string().min(5).max(500), date: z.date(), location: z.string() }).safeParse(req.body);
    if (!body.success) {
        res.status(400).json({ error: "Invalid request body", details: body.error });
        return;
    }
    await db.report.create({ data: { lineNumber: body.data.lineNumber, date: body.data.date.toISOString(), location: body.data.location, description: body.data.reason } });
});
app.listen(3000);

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;