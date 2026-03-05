import mongoose from 'mongoose'

export interface IContract {
    client: mongoose.Types.ObjectId
    program: mongoose.Types.ObjectId
    startDate: string
    endDate: string
}

const ContractSchema = new mongoose.Schema<IContract>({
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true }
}, { timestamps: true })

export default mongoose.model('Contract', ContractSchema)