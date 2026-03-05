import mongoose from 'mongoose'

export interface IProgram {
    name: string
    description: string
    coverage: number
    price: number
}

const ProgramSchema = new mongoose.Schema<IProgram>({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    coverage: { type: Number, required: true },
    price: { type: Number, required: true }
}, { timestamps: true })

export default mongoose.model('Program', ProgramSchema)