import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export const generateToken = (userId: number) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' })
}

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET) as { userId: number };
    } catch (error) {
        return null
    }
}