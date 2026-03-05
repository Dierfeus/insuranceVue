import type { Request, Response, NextFunction } from 'express'

export const agentMiddleware = (req: any, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'agent') {
        return res.status(403).json({ message: 'Нет доступа' })
    }
    next()
}