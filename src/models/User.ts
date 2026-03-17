import mongoose from 'mongoose'

export type Role = 'user' | 'agent' | 'inspector' | 'expert'

const UserSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true, trim: true},

    password: {type: String, required: true},

    role: {type: String, enum: ['user', 'agent', 'inspector', 'expert'], default: 'user'},

    firstName: {type: String, required: true, trim: true},

    lastName: {type: String, required: true, trim: true},

    middleName: {type: String, required: false, trim: true},

    phone: {type: String, required: true
    },

    email: {type: String, required: true, unique: true, lowercase: true, trim: true},

    birthDate: {type: Date, required: true}

}, { timestamps: true })

export default mongoose.model('User', UserSchema)