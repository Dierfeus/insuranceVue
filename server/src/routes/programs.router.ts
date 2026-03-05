import { Router } from 'express'
import Program from '../models/Program.ts'
import { authMiddleware } from '../middleware/auth-middleware.ts'
import { expertMiddleware } from '../middleware/expert-middleware.ts'

const router = Router()

// Получить все программы — доступно всем авторизованным
router.get('/', async (req, res) => {
    try {
        const programs = await Program.find().sort({ createdAt: -1 })
        res.json(programs)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// Создать новую программу — только эксперт
router.post('/', authMiddleware, expertMiddleware, async (req: any, res) => {
    try {
        const { name, description, coverage, price } = req.body
        const existing = await Program.findOne({ name })
        if (existing) return res.status(400).json({ message: 'Программа уже существует' })

        const program = await Program.create({ name, description, coverage, price })
        res.json(program)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// Обновить программу — только эксперт
router.put('/:id', authMiddleware, expertMiddleware, async (req: any, res) => {
    try {
        const { name, description, coverage, price } = req.body
        const program = await Program.findById(req.params.id)
        if (!program) return res.status(404).json({ message: 'Программа не найдена' })

        program.name = name ?? program.name
        program.description = description ?? program.description
        program.coverage = coverage ?? program.coverage
        program.price = price ?? program.price

        await program.save()
        res.json(program)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

export default router