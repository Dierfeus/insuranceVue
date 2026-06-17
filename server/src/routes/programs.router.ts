// server/src/routes/programs.router.ts
import { Router } from 'express'
import Program from '../models/Program.ts'
import { authMiddleware } from '../middleware/auth-middleware.ts'
import { roleMiddleware } from '../middleware/role.middleware.ts'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = Router()

// Настройка хранилища для multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/programs'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  }
})

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Разрешены только JPEG, PNG и WEBP'), false)
  }
}

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
})

// --- Получить все программы ---
router.get('/', authMiddleware, async (req: any, res) => {
    try {
        const programs = await Program.find().sort({ createdAt: -1 })
        res.json(programs)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Создать новую программу (с несколькими изображениями) ---
router.post('/', authMiddleware, roleMiddleware('expert'), upload.array('images', 5), async (req: any, res) => {
    try {
        const { name, description, type, coverage, price, durationDays } = req.body
        
        if (!name || !description || !type || !coverage || !price || !durationDays) {
            return res.status(400).json({ message: 'Все поля обязательны' })
        }

        const existing = await Program.findOne({ name })
        if (existing) return res.status(400).json({ message: 'Program with this name already exists' })

        // 🆕 Формируем массив URL изображений
        let images: string[] = []
        if (req.files && req.files.length > 0) {
            images = (req.files as Express.Multer.File[]).map(file => `/uploads/programs/${file.filename}`)
        }

        const program = await Program.create({ 
            name, 
            description, 
            type, 
            coverage, 
            price, 
            durationDays,
            images
        })
        
        res.json(program)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Изменить программу ---
router.put('/:id', authMiddleware, roleMiddleware('expert'), upload.array('images', 5), async (req: any, res) => {
    try {
        const { name, description, type, coverage, price, durationDays, existingImages } = req.body
        
        const program = await Program.findById(req.params.id)
        if (!program) return res.status(404).json({ message: 'Program not found' })

        program.name = name || program.name
        program.description = description || program.description
        program.type = type || program.type
        program.coverage = coverage || program.coverage
        program.price = price || program.price
        program.durationDays = durationDays || program.durationDays

        // 🆕 Обработка изображений
        let images: string[] = []
        
        // Сохраняем существующие изображения
        if (existingImages) {
            const existing = Array.isArray(existingImages) ? existingImages : [existingImages]
            images = [...existing]
        }

        // Добавляем новые изображения
        if (req.files && req.files.length > 0) {
            const newImages = (req.files as Express.Multer.File[]).map(file => `/uploads/programs/${file.filename}`)
            images = [...images, ...newImages]
        }

        program.images = images
        await program.save()
        res.json(program)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Удалить программу ---
router.delete('/:id', authMiddleware, roleMiddleware('expert'), async (req: any, res) => {
    try {
        const program = await Program.findById(req.params.id)
        if (!program) return res.status(404).json({ message: 'Program not found' })

        // 🆕 Удаляем все изображения
        if (program.images && program.images.length > 0) {
            for (const imagePath of program.images) {
                const fullPath = path.join('.', imagePath)
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath)
                }
            }
        }

        await program.deleteOne()
        res.json({ message: 'Program deleted' })
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Получить программу по id ---
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