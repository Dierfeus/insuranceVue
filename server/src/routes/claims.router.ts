import { Router } from 'express'
import Claim from '../models/Claim.ts'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()
const router = Router()

// Middleware для проверки JWT
const authMiddleware = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ message: 'No token' })

    const token = authHeader.split(' ')[1]
    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
        req.user = decoded
        next()
    } catch {
        res.status(401).json({ message: 'Invalid token' })
    }
}

// Получение заявок текущего пользователя
router.get('/my', authMiddleware, async (req: any, res) => {
    try {
        const claims = await Claim.find({ user: req.user.id }).sort({ createdAt: -1 })
        res.json(claims)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// Создание новой заявки
router.post('/', authMiddleware, async (req: any, res) => {
    try {
        const { type, description, amount, date } = req.body
        const claim = await Claim.create({
            user: req.user.id,
            type,
            description,
            amount,
            date,
            status: 'pending'
        })
        res.json(claim)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

export default router