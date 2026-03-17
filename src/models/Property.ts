import mongoose from 'mongoose'

export interface IProperty {
    client: mongoose.Types.ObjectId
    description: string
    value: number
}

const PropertySchema = new mongoose.Schema<IProperty>({
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    value: { type: Number, required: true }
}, { timestamps: true })

export default mongoose.model('Property', PropertySchema)