
import type { Request, Response, NextFunction } from 'express'

export const expertMiddleware = (req: any, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'expert') {
        return res.status(403).json({ message: 'Нет доступа: только эксперт' })
    }
    next()
}