import mongoose from 'mongoose'

export interface IClaim {
    user: mongoose.Types.ObjectId
    type: string
    description: string
    amount: number
    date: string
    status: 'pending' | 'approved' | 'rejected'
}

const ClaimSchema = new mongoose.Schema<IClaim>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true })

export default mongoose.model('Claim', ClaimSchema)