import { Router } from 'express'
import User from '../models/User.ts'
import { authMiddleware } from '../middleware/auth-middleware.ts'
import { roleMiddleware } from '../middleware/role.middleware.ts'

const router = Router()

// --- Получить всех клиентов (только агент) ---
router.get('/', authMiddleware, roleMiddleware('agent'), async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }, '-password')
        res.json(users)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Обновить данные своего аккаунта (любой авторизованный пользователь) ---
router.put('/me', authMiddleware, async (req: any, res) => {
    try {
        const updated = await User.findByIdAndUpdate(req.user.id, req.body, { new: true }).select('-password')
        res.json(updated)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Обновить клиента (только агент) ---
router.put('/:id', authMiddleware, roleMiddleware('agent'), async (req, res) => {
    try {
        const { username, role } = req.body
        const user = await User.findById(req.params.id)
        if (!user || user.role !== 'user') return res.status(404).json({ message: 'User not found' })
        user.username = username ?? user.username
        user.role = role ?? user.role
        await user.save()
        res.json(user)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Получить данные своего аккаунта (любой авторизованный пользователь) ---
router.get('/me', authMiddleware, async (req: any, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        res.json(user)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})



export default router