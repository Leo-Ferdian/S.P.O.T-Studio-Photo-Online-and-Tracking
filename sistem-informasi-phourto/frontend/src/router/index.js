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
    {
        path: '/forgot-password',
        name: 'ForgotPassword',
        component: () => import('../views/auth/ForgotPassword.vue'),
    },
    {
        path: '/about',
        name: 'AboutUs',
        component: () => import('../views/aboutus.vue'),
    },
    {
        path: '/location',
        name: 'Location',
        component: () => import('../views/Location.vue'),
    },
    {
        path: '/service/:planName', // Rute dinamis
        name: 'ServiceDetail',
        component: () => import('../views/ServiceDetail.vue'),
        props: true // Mengirimkan `planName` sebagai prop ke komponen
    },
    // TODO: Tambahkan rute privat untuk dashboard, booking, dll. di sini
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;