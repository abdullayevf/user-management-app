import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { PrismaClient } from "./generated/prisma"
import authRoutes from './routes/auth'
import userRoutes from './routes/user'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)

app.get('/health', async (req, res) => {
    try {
        await prisma.$connect();
        res.json({ message: "Server and database connected!" })
    } catch (e) {
        res.status(500).json({ error: 'Databsase connection failed' })
    }
})

process.on('beforeExit', async () => {
    await prisma.$disconnect()
})


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})