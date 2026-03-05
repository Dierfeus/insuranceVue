import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Login.vue'
import Register from '../views/Register.vue'

import Dashboard from "../views/Dashboard.vue"
import UserProfile from '../views/User/UserProfile.vue'
import UserClaims from '../views/User/UserClaims.vue'
import InsurancePrograms from '../views/InsurancePrograms.vue'

import AgentClients from "../views/Agent/AgentClients.vue";
import AgentContracts from "../views/Agent/AgentContracts.vue";
import AgentProperty from "../views/Agent/AgentProperty.vue";

import { auth } from '../store/auth'

const routes = [
    { path: '/', component: Login },
    { path: '/register', component: Register },

    // DASHBOARD
    { path: '/user', component: Dashboard, meta: { role: 'user' } },
    { path: '/agent', component: Dashboard, meta: { role: 'agent' } },
    { path: '/inspector', component: Dashboard, meta: { role: 'inspector' } },
    { path: '/expert', component: Dashboard, meta: { role: 'expert' } },

    // USER
    { path: '/user/profile', component: UserProfile, meta: { role: 'user' } },
    { path: '/user/claims', component: UserClaims, meta: { role: 'user' } },
    { path: '/user/programs', component: InsurancePrograms, meta: { role: 'user' } },

    // AGENT
    { path: '/agent/clients', component: AgentClients, meta: { role: 'agent' } },
    { path: '/agent/contracts', component: AgentContracts, meta: { role: 'agent' } },
    { path: '/agent/programs', component: InsurancePrograms, meta: { role: 'agent' } },
    { path: '/agent/property', component: AgentProperty, meta: { role: 'agent' } },

    // INSPECTOR
    { path: '/inspector/property', component: AgentProperty, meta: { role: 'inspector' } },

    // EXPERT
    { path: '/expert/reports', component: InsurancePrograms, meta: { role: 'expert' } },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Защита маршрутов по роли
router.beforeEach((to, _, next) => {
    if (!to.meta.role) return next()
    if (auth.role === to.meta.role) return next()
    next('/') // если роль не совпадает → на login
})

export default router