import mongoose from 'mongoose'

export interface IContract {
    claim: mongoose.Types.ObjectId
    agent: mongoose.Types.ObjectId
    client: mongoose.Types.ObjectId
    programType: string
    propertyData: any
    properties?: mongoose.Types.ObjectId[]    // список имущества, включённого в договор
    premiumAmount: number
    startDate: string
    durationDays: number
    status: 'active' | 'closed' | 'cancelled'
}

const ContractSchema = new mongoose.Schema<IContract>({
    claim: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', required: true, unique: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    programType: { type: String, required: true },
    propertyData: { type: mongoose.Schema.Types.Mixed, required: true },
    properties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
    premiumAmount: { type: Number, required: true },
    startDate: { type: String, required: true },
    durationDays: { type: Number, required: true },
    status: { type: String, enum: ['active','closed','cancelled'], default: 'active' }
}, { timestamps: true })

export default mongoose.model('Contract', ContractSchema)