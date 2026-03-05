import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.router.ts'
import claimRoutes from './routes/claims.router.ts'
import programRoutes from './routes/programs.router.ts'
import userRoutes from './routes/users.ts'
import propertyRoutes from './routes/property.router.ts'
import contractRoutes from './routes/contracts.ts'



dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URL!)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err))

app.use('/auth', authRoutes)
app.use('/api/claims', claimRoutes)
app.use('/api/programs', programRoutes)
app.use('/api/users', userRoutes)
app.use('/api/property', propertyRoutes)
app.use('/api/contracts', contractRoutes)

app.listen(process.env.PORT || 5000, () => console.log(`Server running on port ${process.env.PORT || 5000}`))