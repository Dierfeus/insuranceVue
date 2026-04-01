import mongoose, { Document } from 'mongoose'

// Основной интерфейс
export interface IClaim {
    user: mongoose.Types.ObjectId
    program: mongoose.Types.ObjectId

    propertyData: {
        address?: string
        carModel?: string
    }

    startDate: string
    durationDays: number

    status: 'pending' | 'approved' | 'rejected' | 'evaluated' | 'priced' | 'closed'

    evaluation?: {
        value: number
        evaluator: mongoose.Types.ObjectId
        date: string
    }

    premium?: {
        amount: number
        actuary: mongoose.Types.ObjectId
        date: string
    }

    agentNotes?: string
}

export interface IClaimDocument extends IClaim, Document {}

// Схема
const ClaimSchema = new mongoose.Schema<IClaimDocument>(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

        program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },

        propertyData: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },

        startDate: { type: String, required: true },

        durationDays: { type: Number, required: true },

        status: {
            type: String,
            enum: ['pending','approved','rejected','evaluated','priced','closed'],
            default: 'pending'
        },

        evaluation: {
            value: Number,
            evaluator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            date: String
        },

        premium: {
            amount: Number,
            actuary: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            date: String
        },

        agentNotes: String
    },
    { timestamps: true }
)

const Claim = mongoose.model<IClaimDocument>('Claim', ClaimSchema)

export default Claim