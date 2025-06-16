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

const allowedOrigins = (process.env.FRONTEND_URLS || 'http://localhost:4173').split(',');

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}))
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