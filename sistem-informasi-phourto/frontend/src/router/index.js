import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/home.vue';
import Login from '../views/auth/login.vue';
import Register from '../views/auth/register.vue';

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
        component: Login,
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
    },
    // TODO: Tambahkan rute privat untuk dashboard, booking, dll. di sini
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;