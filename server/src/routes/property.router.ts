import { Router } from 'express'
import Property from '../models/Property.ts'
import User from '../models/User.ts'
import { agentMiddleware } from '../middleware/agent-middleware.ts'

const router = Router()

// Получить все имущество
router.get('/', agentMiddleware, async (req, res) => {
    try {
        const properties = await Property.find().populate('client', 'username')
        res.json(properties)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// Добавить новое имущество
router.post('/', agentMiddleware, async (req: any, res) => {
    try {
        const { clientId, description, value } = req.body
        const client = await User.findById(clientId)
        if (!client || client.role !== 'user') return res.status(404).json({ message: 'User not found' })

        const property = await Property.create({ client: clientId, description, value })
        res.json(property)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// Редактировать имущество
router.put('/:id', agentMiddleware, async (req: any, res) => {
    try {
        const property = await Property.findById(req.params.id)
        if (!property) return res.status(404).json({ message: 'Property not found' })

        const { description, value } = req.body
        property.description = description ?? property.description
        property.value = value ?? property.value
        await property.save()
        res.json(property)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// Удалить имущество
router.delete('/:id', agentMiddleware, async (req, res) => {
    try {
        const property = await Property.findByIdAndDelete(req.params.id)
        if (!property) return res.status(404).json({ message: 'Property not found' })
        res.json({ message: 'Deleted' })
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

export default router