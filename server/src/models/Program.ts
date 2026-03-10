import mongoose from 'mongoose'

export interface IProgram {
    name: string
    description: string
    type: 'home' | 'apartment' | 'car' | 'other'
    coverage: number       // страховая сумма
    price: number          // стоимость программы
    durationDays: number   // рекомендуемый срок действия
}

const ProgramSchema = new mongoose.Schema<IProgram>({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['home','apartment','car','other'], required: true },
    coverage: { type: Number, required: true },
    price: { type: Number, required: true },
    durationDays: { type: Number, required: true }
}, { timestamps: true })

export default mongoose.model('Program', ProgramSchema)