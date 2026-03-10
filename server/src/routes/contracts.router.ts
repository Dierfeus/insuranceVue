import { Router } from 'express'
import Contract from '../models/Contract.ts'
import Claim from '../models/Claim.ts'
import { authMiddleware } from '../middleware/auth-middleware.ts'
import { roleMiddleware } from '../middleware/role.middleware.ts'
import Property from '../models/Property.ts'

const router = Router()

// --- Создание договора (только агент) ---
router.post('/', authMiddleware, roleMiddleware('agent'), async (req: any, res) => {
    try {
        const { claimId, startDate, durationDays, premiumAmount, properties } = req.body

        // Проверяем, что заявка существует
        const claim = await Claim.findById(claimId)
        if (!claim) return res.status(404).json({ message: 'Claim not found' })

        // Проверяем, что договор на эту заявку ещё не создан (unique)
        const existingContract = await Contract.findOne({ claim: claimId })
        if (existingContract) return res.status(400).json({ message: 'Contract for this claim already exists' })

        // Проверяем, что все переданные properties принадлежат клиенту
        if (properties && properties.length > 0) {
            const validProps = await Property.find({ _id: { $in: properties }, client: claim.user })
            if (validProps.length !== properties.length) {
                return res.status(400).json({ message: 'Some properties are invalid or do not belong to the client' })
            }
        }

        const contract = await Contract.create({
            claim: claimId,
            agent: req.user.id,
            client: claim.user,
            programType: claim.program.toString(),
            propertyData: claim.propertyData,
            properties: properties || [],         // добавляем имущество
            premiumAmount,
            startDate,
            durationDays,
            status: 'active'
        })

        res.json(contract)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Просмотр всех договоров (только агент) ---
router.get('/', authMiddleware, roleMiddleware('agent'), async (req: any, res) => {
    try {
        const contracts = await Contract.find()
            .populate('claim', 'status')
            .populate('agent', 'firstName lastName')
            .populate('client', 'firstName lastName phone')
            .sort({ createdAt: -1 })
        res.json(contracts)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Просмотр договоров конкретного пользователя (только пользователь) ---
router.get('/my', authMiddleware, roleMiddleware('user'), async (req: any, res) => {
    try {
        const contracts = await Contract.find({ client: req.user.id })
            .populate('claim', 'status')
            .populate('agent', 'firstName lastName')
            .sort({ createdAt: -1 })
        res.json(contracts)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Изменение договора (только агент) ---
router.put('/:id', authMiddleware, roleMiddleware('agent'), async (req: any, res) => {
    try {
        const { startDate, durationDays, premiumAmount, status } = req.body

        const contract = await Contract.findByIdAndUpdate(
            req.params.id,
            { startDate, durationDays, premiumAmount, status },
            { new: true }
        )

        if (!contract) return res.status(404).json({ message: 'Contract not found' })

        res.json(contract)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Изменение имущество (только агент) ---
router.put('/:id', authMiddleware, roleMiddleware('agent'), async (req: any, res) => {
    try {
        const { startDate, durationDays, premiumAmount, status, properties } = req.body

        // Проверка на имущество
        if (properties && properties.length > 0) {
            const contract = await Contract.findById(req.params.id)
            if (!contract) return res.status(404).json({ message: 'Contract not found' })

            const validProps = await Property.find({ _id: { $in: properties }, client: contract.client })
            if (validProps.length !== properties.length) {
                return res.status(400).json({ message: 'Some properties are invalid or do not belong to the client' })
            }
        }

        const contract = await Contract.findByIdAndUpdate(
            req.params.id,
            { startDate, durationDays, premiumAmount, status, properties },
            { new: true }
        )

        if (!contract) return res.status(404).json({ message: 'Contract not found' })

        res.json(contract)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})


export default router