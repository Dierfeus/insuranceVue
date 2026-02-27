import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.ts'
import dotenv from 'dotenv'
dotenv.config()

const router = Router()

// Регистрация
router.post('/register', async (req, res) => {
    try {
        const { username, password, role } = req.body
        const existing = await User.findOne({ username })
        if (existing) return res.status(400).json({ message: 'User exists' })

        const hashed = await bcrypt.hash(password, 5)
        const user = await User.create({ username, password: hashed, role })
        res.json({ message: 'User created', user: { id: user._id, username, role } })
    } catch (err) {
        res.status(500).json({ message: 'Server error' })
    }
})

// Логин
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await User.findOne({ username })
        if (!user) return res.status(404).json({ message: 'User not found' })

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) return res.status(400).json({ message: 'Wrong password' })

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '24h' })
        res.json({ token, role: user.role })
    } catch (err) {
        res.status(500).json({ message: 'Server error' })
    }
})

export default router