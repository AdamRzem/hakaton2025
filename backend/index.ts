import argon from "argon2";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "./db";
import { publicProcedure, router } from './trpc';
const SUPER_SECRET_KEY = "testing" as const;
const appRouter = router({
    register: publicProcedure.input(z.object({ email: z.email(), password: z.string() })).mutation(async (opts) => {
        const hash = await argon.hash(opts.input.password)
        const res = await db.user.create({ data: { email: opts.input.email, password: hash, reputation: 0 } });
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


    })
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;