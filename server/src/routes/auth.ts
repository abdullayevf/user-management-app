import express from "express"
import bcrypt from 'bcryptjs'
import { PrismaClient } from "../generated/prisma"
import { generateToken } from "../utils/jwt"
import { authMiddleware, AuthRequest } from "../middleware/auth"

const router = express.Router()
const prisma = new PrismaClient()

router.post('/register', async (req, res): Promise<void> => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            res.status(400).json({ error: "All fields are required" })
            return
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })

        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        })

        const token = generateToken(user.id)

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        })
    } catch (error) {
        if ((error as any).code === 'P2002') {
            res.status(400).json({ error: "Email already registered" })
            return
        }

        res.status(500).json({ message: 'Registration failed', error: error })
    }
})

router.post("/login", async (req, res): Promise<void> => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            res.status(401).json({ message: "All fields are required." })
            return
        }

        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            res.status(401).json({ message: "User not found" })
            return
        }

        if (user.blocked) {
            res.status(401).json({ error: 'User is blocked' })
            return
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid password" })
            return
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        })

        const token = generateToken(user.id)

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            }
        })

    } catch (error) {
        res.status(500).json({ error: "Login failed" })
    }
})

// Get current user data
router.get("/me", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: {
                id: true,
                name: true,
                email: true
            }
        })

        if (!user) {
            res.status(401).json({ error: "User not found" })
            return
        }

        res.json({ user })
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user data" })
    }
})

export default router