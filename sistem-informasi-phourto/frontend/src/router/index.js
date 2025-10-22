import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/home.vue';
import Login from '../views/auth/login.vue';
import Register from '../views/auth/register.vue';
import AdminLayout from '../components/layout/AdminLayout.vue';
import { useAuthStore } from '../stores/auth.stores';

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
    {
        path: '/location/:branchName', // Rute dinamis untuk detail cabang
        name: 'BranchDetail',
        component: () => import('../views/BranchDetail.vue'),
        props: true // Mengirimkan `branchName` sebagai prop ke komponen
    },

    {
        path: '/booking/summary', // URL untuk halaman summary
        name: 'BookingSummary',
        component: () => import('../views/booking/Summary.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/claimphotos', // URL untuk halaman claim photos
        name: 'claimphotos',
        component: () => import('../views/claimphotos.vue'),
    },
    // TODO: Tambahkan rute privat untuk dashboard, booking, dll. di sini
    {
        path: '/admin',
        component: AdminLayout,
        meta: { requiresAuth: true, requiresAdmin: true }, // Lindungi seluruh grup
        children: [
            {
                path: 'dashboard',
                name: 'AdminDashboard',
                component: () => import('../views/admin/Dashboard.vue'),
            },
            {
                path: 'bookings',
                name: 'AdminBookings',
                component: () => import('../views/admin/BookingList.vue'),
            },
            // Tambahkan rute admin lain di sini (bookings, packages, dll.)
        ]
    },
    {
        path: '/konfirmasipesanan',
        name: 'konfirmasipesanan',
        component: () => import('../views/booking/konfirmasipesanan.vue'),
    },
    {
        path: '/booking',
        name: 'booking',
        component: () => import('../views/booking/booking.vue'),

    },
    {
        path: '/framecatalog',
        name: 'framecatalog',
        component: () => import('../views/framecatalog.vue'),
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

    if (requiresAuth && !authStore.isLoggedIn) {
        next('/login');
    } else if (requiresAdmin && !authStore.isAdmin) {
        // Jika butuh admin tapi user bukan admin, alihkan ke halaman utama
        next('/');
    } else {
        next();
    }
});

export default router;