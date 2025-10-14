import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/home.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/login',
        name: 'Login',
        // Lazy loading: Komponen hanya di-load saat halamannya diakses
        component: () => import('../views/auth/login.vue'),
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../views/auth/register.vue'),
    },
    // TODO: Tambahkan rute privat untuk dashboard, booking, dll. di sini
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;