import express from 'express'
import { PrismaClient } from '../generated/prisma'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// get all users (for the table)

router.get("/", authMiddleware, async (req: AuthRequest, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                lastLogin: true,
                blocked: true,
                createdAt: true
            },
            orderBy: {
                lastLogin: 'desc'
            }
        })

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' })
    }
})

// Block users (bulk action)

router.post("/block", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
    try {
        const { userIds } = req.body;

        if (!Array.isArray(userIds) || userIds.length == 0) {
            res.status(400).json({ message: "User IDs are required" })
            return
        }

        await prisma.user.updateMany({
            where: {
                id: { in: userIds }
            },
            data: {
                blocked: true
            }
        })

        res.json({ message: `${userIds.length} user(s) blocked succsessfully` })
    } catch (error) {
        res.status(500).json({ message: "Failed to block users." })
    }
})

// Unblock users (bulk operation)

router.post("/unblock", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
    try {
        const { userIds } = req.body;

        if (!Array.isArray(userIds) || userIds.length == 0) {
            res.status(400).json({ message: "User IDs are required" })
            return
        }

        await prisma.user.updateMany({
            where: {
                id: { in: userIds }
            },
            data: {
                blocked: false
            }
        })

        res.json({ message: `${userIds.length} user(s) unblocked succsessfully` })
    } catch (error) {
        res.status(500).json({ message: "Failed to unblock users." })
    }
})

//  Delete users (bulk operation)

router.delete("/delete", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
    try {
        const { userIds } = req.body;

        if (!Array.isArray(userIds) || userIds.length == 0) {
            res.status(400).json({ message: "User IDs are required" })
            return
        }

        await prisma.user.deleteMany({
            where: {
                id: { in: userIds }
            }
        })

        res.json({ message: `${userIds.length} user(s) deleted succsessfully` })
    } catch (error) {
        res.status(500).json({ message: "Failed to delete users." })
    }
})

export default router;