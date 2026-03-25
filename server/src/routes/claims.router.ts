import { Router } from 'express'
import Claim from '../models/Claim.ts'
import { authMiddleware } from '../middleware/auth-middleware.ts'
import { roleMiddleware } from '../middleware/role.middleware.ts'
import User from '../models/User.ts'


const router = Router()



// --- Создание заявки ---
// Пользователь создаёт только на себя, агент – на любого
router.post('/', authMiddleware, async (req: any, res) => {
    try {
        const { userId, phone, program, propertyData, startDate, durationDays } = req.body

        let targetUserId = req.user.id

        // если агент
        if (req.user.role === 'agent') {

            if (phone) {
                const user = await User.findOne({ phone })

                if (!user) {
                    return res.status(404).json({ message: 'Клиент не найден' })
                }

                targetUserId = user._id
            } else if (userId) {
                targetUserId = userId
            }
        }

        // пользователь может только себе
        if (req.user.role === 'user') {
            targetUserId = req.user.id
        }

        const claim = await Claim.create({
            user: targetUserId,
            program,
            propertyData,
            startDate,
            durationDays,
            status: 'pending'
        })

        res.json(claim)

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Просмотр своих заявок (только user) ---
router.get('/my', authMiddleware, roleMiddleware('user'), async (req: any, res) => {
    try {
        const claims = await Claim.find({ user: req.user.id })
            .populate('program', 'name')
            .sort({ createdAt: -1 })
        res.json(claims)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Просмотр всех заявок (agent, expert, inspector, admin) ---
router.get('/', authMiddleware, roleMiddleware(['agent','expert','inspector','admin']), async (req: any, res) => {
    try {
        const claims = await Claim.find()
            .populate('user', 'firstName lastName phone')
            .populate('program', 'name')
            .sort({ createdAt: -1 })
        res.json(claims)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Просмотр заявок конкретного клиента (только agent) ---
router.get('/client/:id', authMiddleware, roleMiddleware('agent'), async (req: any, res) => {
    try {
        const claims = await Claim.find({ user: req.params.id })
            .populate('program', 'name')
            .sort({ createdAt: -1 })
        res.json(claims)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Изменение статуса заявки (только agent) ---
router.put('/:id/status', authMiddleware, roleMiddleware('agent'), async (req: any, res) => {
    try {
        const { status } = req.body
        if (!['pending','approved','rejected','evaluated','priced','closed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' })
        }
        const claim = await Claim.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        )
        res.json(claim)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Добавление/редактирование заметок агента (только agent) ---
router.put('/:id/notes', authMiddleware, roleMiddleware('agent'), async (req: any, res) => {
    try {
        const { agentNotes } = req.body
        const claim = await Claim.findByIdAndUpdate(
            req.params.id,
            { agentNotes },
            { new: true }
        )
        res.json(claim)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Добавление оценки (только inspector) ---
router.put('/:id/evaluate', authMiddleware, roleMiddleware('inspector'), async (req: any, res) => {
    try {
        const { value } = req.body
        const claim = await Claim.findByIdAndUpdate(
            req.params.id,
            { evaluation: { value, evaluator: req.user.id, date: new Date().toISOString() }, status: 'evaluated' },
            { new: true }
        )
        res.json(claim)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Добавление премии  (только expert) ---
router.put('/:id/premium', authMiddleware, roleMiddleware('expert'), async (req: any, res) => {
    try {
        const { amount } = req.body
        const claim = await Claim.findByIdAndUpdate(
            req.params.id,
            { premium: { amount, actuary: req.user.id, date: new Date().toISOString() }, status: 'priced' },
            { new: true }
        )
        res.json(claim)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Удаление заявки (только пользователь и только pending) ---
router.delete('/:id', authMiddleware, roleMiddleware('user'), async (req: any, res) => {
    try {
        const claim = await Claim.findById(req.params.id)

        if (!claim) {
            return res.status(404).json({ message: 'Заявка не найдена' })
        }

        if (claim.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Нет доступа' })
        }

        // Проверка статуса
        if (claim.status !== 'pending') {
            return res.status(400).json({ message: 'Можно удалить только отправленную заявку' })
        }

        await claim.deleteOne()

        res.json({ message: 'Заявка удалена' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

export default router