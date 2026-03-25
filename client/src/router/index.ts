import { createRouter, createWebHistory } from 'vue-router'

import { auth } from '../store/auth'

import DashboardPage from '../views/Dashboard.vue'
import NotFoundPage from '../views/NotFoundPage.vue'
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import FirstDisplay from "../views/FirstDisplay.vue";
import Profile from "../views/User/UserProfile.vue";

const routes = [
    { path: '/', component: FirstDisplay },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/dashboard', name: 'Dashboard', component: DashboardPage, meta: { roles: ['agent', 'inspector', 'expert'] } },
    { path: '/:pathMatch(.*)*', component: NotFoundPage },
    { path: '/profile', component: Profile, meta: { roles: ['user'] } },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, _, next) => {
    if (!to.meta.role) return next()
    if (auth.role === to.meta.role) return next()
    next('/')
})


export default router