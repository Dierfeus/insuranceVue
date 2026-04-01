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

// --- Просмотр имущества (inspector) ---
router.get('/', authMiddleware, roleMiddleware(['inspector', 'agent']), async (req: any, res) => {
    try {
        const { role } = req.user;
        if (role === 'inspector' || role === 'agent') {
            const properties = await Property.find()
                .sort({ createdAt: -1 })
                .populate('client', 'name email'); // Подтягиваем данные клиента
            return res.json(properties);
        }
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// --- Получение только СВОЕГО имущества (для обычного пользователя) ---
router.get('/me', authMiddleware, async (req: any, res) => {
    try {
        // Здесь фильтрация строго по ID из токена
        const properties = await Property.find({ client: req.user.id }).sort({ createdAt: -1 })
        res.json(properties)
    } catch (err) {
        res.status(500).json({ message: 'Server error' })
    }
})

export default router