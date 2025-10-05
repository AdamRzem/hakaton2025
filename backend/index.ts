import { TRPCError } from "@trpc/server";
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import argon from "argon2";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "./db";
import { publicProcedure, router } from './trpc';
const SUPER_SECRET_KEY = "testing" as const;

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
        console.log(typeof opts.input.date);
        console.log(opts.input.date);
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

        await db.report.create({ data: { location: opts.input.location, userId: userId, date: opts.input.date, lineNumber: opts.input.lineNumber, description: opts.input.description } })
    }),
    getReports: publicProcedure.query(async (opts) => {
        return db.report.findMany({ include: { user: true } })
    })
});
const server = createHTTPServer({
    router: appRouter,
});

server.listen(3000, "0.0.0.0");

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;