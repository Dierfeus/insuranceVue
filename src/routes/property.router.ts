import { Router } from 'express'
import Property from '../models/Property.ts'
import Contract from '../models/Contract.ts'
import { authMiddleware } from '../middleware/auth-middleware.ts'
import { roleMiddleware } from '../middleware/role.middleware.ts'

const router = Router()

// --- Добавление имущества (inspector) ---
router.post('/', authMiddleware, roleMiddleware('inspector'), async (req: any, res) => {
    try {
        const { client, description, value } = req.body
        const property = await Property.create({ client, description, value })
        res.json(property)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Изменение имущества (inspector) ---
router.put('/:id', authMiddleware, roleMiddleware('inspector'), async (req: any, res) => {
    try {
        const { description, value } = req.body
        const property = await Property.findByIdAndUpdate(
            req.params.id,
            { description, value },
            { new: true }
        )
        if (!property) return res.status(404).json({ message: 'Property not found' })
        res.json(property)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Удаление имущества (inspector) ---
router.delete('/:id', authMiddleware, roleMiddleware('inspector'), async (req: any, res) => {
    try {
        const property = await Property.findByIdAndDelete(req.params.id)
        if (!property) return res.status(404).json({ message: 'Property not found' })
        res.json({ message: 'Property deleted' })
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Просмотр имущества для пользователя (своё) и агента (по договорам) ---
router.get('/', authMiddleware, async (req: any, res) => {
    try {
        let properties

        if (req.user.role === 'user') {
            // Пользователь видит только своё имущество
            properties = await Property.find({ client: req.user.id }).sort({ createdAt: -1 })
        } else if (req.user.role === 'agent') {
            // Агент видит имущество, которое включено в его договора
            const contracts = await Contract.find({ agent: req.user.id }).select('properties')
            const propertyIds = contracts.flatMap(c => (c as any).properties || [])
            properties = await Property.find({ _id: { $in: propertyIds } }).sort({ createdAt: -1 })
        } else {
            return res.status(403).json({ message: 'Access denied' })
        }

        res.json(properties)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

export default router