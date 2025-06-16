import { Request, Response, NextFunction } from "express"
import { PrismaClient } from "../generated/prisma"
import { verifyToken } from "../utils/jwt"
import { verify } from "crypto";

const prisma = new PrismaClient()

export interface AuthRequest extends Request {
    userId?: number;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction):Promise<void> => {
    try {
        const token = req.header("Authorization")?.replace('Bearer ', '')

        if (!token) {
            res.status(401).json({ error: 'No token provided' })
            return
        }

        const decoded = verifyToken(token);

        if (!decoded) {
            res.status(401).json({ error: "Invalid token provided" })
            return
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        })

        if (!user) {
            res.status(401).json({ error: "User not found" })
            return
        }

        if (user?.blocked) {
            res.status(403).json({ error: "User is blocked" })
            return
        }

        req.userId = user?.id
        next()
    } catch (error) {
        res.status(401).json({ error: "Authentication failed" })
    }
}