import mongoose from 'mongoose'

export interface IClaim {
    user: mongoose.Types.ObjectId               // клиент
    program: mongoose.Types.ObjectId           // ссылка на выбранную программу
    propertyData: any                           // данные об имуществе, структура зависит от программы
    startDate: string                           // желаемая дата начала
    durationDays: number                        // срок страхования в днях
    status: 'pending' | 'approved' | 'rejected' | 'evaluated' | 'priced' | 'closed'
    evaluation?: {
        value: number                           // оценочная стоимость имущества
        evaluator: mongoose.Types.ObjectId      // оценщик
        date: string
    }
    premium?: {
        amount: number                          // страховая сумма
        actuary: mongoose.Types.ObjectId
        date: string
    }
    agentNotes?: string                         // агент может редактировать/добавлять заметки
}

const ClaimSchema = new mongoose.Schema<IClaim>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
    propertyData: { type: mongoose.Schema.Types.Mixed, required: true },
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
}, { timestamps: true })

export default mongoose.model('Claim', ClaimSchema)