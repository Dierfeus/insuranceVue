import mongoose from 'mongoose'

export type Role = 'user' | 'agent' | 'inspector' | 'expert'

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['user', 'agent', 'inspector', 'expert'],
        default: 'user'
    }
})

export default mongoose.model('User', UserSchema)