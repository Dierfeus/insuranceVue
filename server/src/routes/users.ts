import { Router } from 'express'
import User from '../models/User.ts'
import { agentMiddleware } from '../middleware/agent-middleware.ts'
import { authMiddleware } from '../middleware/auth-middleware.ts'

const router = Router()

// Получить всех клиентов
router.get('/', authMiddleware, agentMiddleware, async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }, '-password')
        res.json(users)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// Обновить клиента
router.put('/:id', authMiddleware, agentMiddleware, async (req, res) => {
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

router.get('/me', authMiddleware, async (req: any, res) => {
    const user = await User.findById(req.user.id).select('-password')
    res.json(user)
})

router.put('/me', authMiddleware, async (req: any, res) => {
    const updated = await User.findByIdAndUpdate(
        req.user.id,
        req.body,
        { new: true }
    ).select('-password')

    res.json(updated)
})


export default router