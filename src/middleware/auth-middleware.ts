import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ message: 'Нет токена' })

    const token = authHeader.split(' ')[1]
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!)
        req.user = decoded // { id, role }
        next()
    } catch {
        res.status(401).json({ message: 'Неверный токен' })
    }
}