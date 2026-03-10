import type { Response, NextFunction } from 'express'

type Role = string | string[]

export const roleMiddleware = (requiredRole: Role) => {
    return (req: any, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Нет авторизации' })
        }

        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Нет доступа: требуется роль ${roles.join(', ')}` })
        }

        next()
    }
}