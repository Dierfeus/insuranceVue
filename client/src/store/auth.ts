import { reactive } from 'vue'
import axios from 'axios'
import router from "../router";

interface RegisterData {
    username: string
    password: string
    firstName: string
    lastName: string
    middleName: string
    phone: string
    email: string
    birthDate: string
}

interface AuthState {
    token: string | null
    role: string | null
    login: (username: string, password: string) => Promise<void>
    register: (data: RegisterData) => Promise<void>
    logout: () => void
}

export const auth = reactive<AuthState>({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),

    async login(username, password) {
        const res = await axios.post('http://localhost:5000/auth/login', { username, password })
        this.token = res.data.token
        this.role = res.data.role
        localStorage.setItem('token', this.token!)
        localStorage.setItem('role', this.role!)

        router.push('/dashboard')
    },

    async register(data) {
        await axios.post('http://localhost:5000/auth/register', {
            ...data,
            role: 'user'
        })
    },

    logout() {
        this.token = null
        this.role = null
        localStorage.removeItem('token')
        localStorage.removeItem('role')
    }
})