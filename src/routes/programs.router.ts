import { Router } from 'express'
import Program from '../models/Program.ts'
import { authMiddleware } from '../middleware/auth-middleware.ts'
import { roleMiddleware } from '../middleware/role.middleware.ts'

const router = Router()

// --- Получить все программы (доступно всем) ---
router.get('/', authMiddleware, async (req: any, res) => {
    try {
        const programs = await Program.find().sort({ createdAt: -1 })
        res.json(programs)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Создать новую программу (только expert) ---
router.post('/', authMiddleware, roleMiddleware('expert'), async (req: any, res) => {
    try {
        const { name, description, type, coverage, price, durationDays } = req.body

        const existing = await Program.findOne({ name })
        if (existing) return res.status(400).json({ message: 'Program with this name already exists' })

        const program = await Program.create({ name, description, type, coverage, price, durationDays })
        res.json(program)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Изменить программу (только expert) ---
router.put('/:id', authMiddleware, roleMiddleware('expert'), async (req: any, res) => {
    try {
        const { name, description, type, coverage, price, durationDays } = req.body

        const program = await Program.findByIdAndUpdate(
            req.params.id,
            { name, description, type, coverage, price, durationDays },
            { new: true }
        )

        if (!program) return res.status(404).json({ message: 'Program not found' })
        res.json(program)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Получить программу по id (доступно всем) ---
router.get('/:id', authMiddleware, async (req: any, res) => {
    try {
        const program = await Program.findById(req.params.id)
        if (!program) return res.status(404).json({ message: 'Program not found' })
        res.json(program)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

export default router