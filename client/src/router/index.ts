import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import User from '../views/User.vue'
import Agent from '../views/Agent.vue'
import Inspector from '../views/Inspector.vue'
import Expert from '../views/Expert.vue'
import { auth } from '../store/auth'

const routes = [
    { path: '/', component: Login },
    { path: '/register', component: Register },
    { path: '/user', component: User, meta: { role: 'user' } },
    { path: '/agent', component: Agent, meta: { role: 'agent' } },
    { path: '/inspector', component: Inspector, meta: { role: 'inspector' } },
    { path: '/expert', component: Expert, meta: { role: 'expert' } },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to, _, next) => {
    if (!to.meta.role) return next()
    if (auth.role === to.meta.role) return next()
    next('/')
})

export default router