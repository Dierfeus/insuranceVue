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
    // Создаем папку, если её нет
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

// Фильтр файлов
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
})

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
router.post('/', authMiddleware, roleMiddleware('expert'), upload.single('image'), async (req: any, res) => {
    try {
        const { name, description, type, coverage, price, durationDays } = req.body
        
        // Проверяем, что все поля заполнены
        if (!name || !description || !type || !coverage || !price || !durationDays) {
            return res.status(400).json({ message: 'Все поля обязательны' })
        }

        const existing = await Program.findOne({ name })
        if (existing) return res.status(400).json({ message: 'Program with this name already exists' })

        // Формируем URL изображения
        let imageUrl = null
        if (req.file) {
            imageUrl = `/uploads/programs/${req.file.filename}`
        }

        const program = await Program.create({ 
            name, 
            description, 
            type, 
            coverage, 
            price, 
            durationDays,
            imageUrl 
        })
        
        res.json(program)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Изменить программу (только expert) ---
router.put('/:id', authMiddleware, roleMiddleware('expert'), upload.single('image'), async (req: any, res) => {
    try {
        const { name, description, type, coverage, price, durationDays } = req.body
        
        const program = await Program.findById(req.params.id)
        if (!program) return res.status(404).json({ message: 'Program not found' })

        // Обновляем поля
        program.name = name || program.name
        program.description = description || program.description
        program.type = type || program.type
        program.coverage = coverage || program.coverage
        program.price = price || program.price
        program.durationDays = durationDays || program.durationDays

        // Если загружено новое изображение
        if (req.file) {
            // Удаляем старое изображение, если оно было
            if (program.imageUrl) {
                const oldPath = path.join('.', program.imageUrl)
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath)
                }
            }
            program.imageUrl = `/uploads/programs/${req.file.filename}`
        }

        await program.save()
        res.json(program)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

// --- Удалить программу (только expert) ---
router.delete('/:id', authMiddleware, roleMiddleware('expert'), async (req: any, res) => {
    try {
        const program = await Program.findById(req.params.id)
        if (!program) return res.status(404).json({ message: 'Program not found' })

        // Удаляем изображение, если оно было
        if (program.imageUrl) {
            const imagePath = path.join('.', program.imageUrl)
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath)
            }
        }

        await program.deleteOne()
        res.json({ message: 'Program deleted' })
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