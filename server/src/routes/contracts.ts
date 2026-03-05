import { Router } from 'express'
import Contract from '../models/Contract.ts'
import User from '../models/User.ts'
import Program from '../models/Program.ts'
import { agentMiddleware } from '../middleware/agent-middleware.ts'

const router = Router()

// Получить все договора
router.get('/', agentMiddleware, async (req, res) => {
    try {
        const contracts = await Contract.find()
            .populate('client', 'username')
            .populate('program', 'name')
        res.json(contracts)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// Создать договор
router.post('/', agentMiddleware, async (req: any, res) => {
    try {
        const { clientId, programId, startDate, endDate } = req.body
        const client = await User.findById(clientId)
        const program = await Program.findById(programId)
        if (!client || client.role !== 'user') return res.status(404).json({ message: 'Client not found' })
        if (!program) return res.status(404).json({ message: 'Program not found' })

        const contract = await Contract.create({ client: clientId, program: programId, startDate, endDate })
        res.json(contract)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

export default router