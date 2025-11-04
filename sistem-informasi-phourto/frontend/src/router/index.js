import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home.vue'
import Login from '../views/auth/login.vue'
import Register from '../views/auth/register.vue'
import AdminLayout from '../components/layout/AdminLayout.vue'
import { useAuthStore } from '../stores/auth.stores' // gunakan alias '@' jika sudah diset di vite.config.js

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { requiresGuest: true },
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
        meta: { requiresGuest: true },
    },
    {
        path: '/admin/login',
        name: 'AdminLogin',
        component: () => import('../views/auth/AdminLogin.vue'),
        meta: { requiresGuest: true },
    },
    {
        path: '/forgot-password',
        name: 'ForgotPassword',
        component: () => import('../views/auth/ForgotPassword.vue'),
        meta: { requiresGuest: true },
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
        path: '/service/:planName',
        name: 'ServiceDetail',
        component: () => import('../views/ServiceDetail.vue'),
        props: true,
    },
    {
        path: '/location/:branchName',
        name: 'BranchDetail',
        component: () => import('../views/BranchDetail.vue'),
        props: true,
    },
    {
        path: '/booking/summary',
        name: 'BookingSummary',
        component: () => import('../views/booking/Summary.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/claimphotos',
        name: 'ClaimPhotos',
        component: () => import('../views/claimphotos.vue'),
    },
    {
    path: '/booking/ClaimResult',
    name: 'ClaimResult',
    component: () => import('../views/booking/ClaimResult.vue'),
    meta: { requiresAuth: true },
    },
    {
        path: '/booking/confirm',
        name: 'BookingConfirmation',
        component: () => import('../views/booking/Confirmation.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/framecatalog',
        name: 'FrameCatalog',
        component: () => import('../views/framecatalog.vue'),
    },
    {
        path: '/booking/:branchSlug/:packageId',
        name: 'BookingAppointment',
        component: () => import('../views/booking/BookingAppointment.vue'),
        props: true,
        meta: { requiresAuth: true },
    },
    {
        path: '/booking/success',
        name: 'BookingSuccess',
        component: () => import('../views/booking/Success.vue'),
        meta: { requiresAuth: true },
    },
    // --- Grup rute untuk admin ---
    {
        path: '/admin',
        component: AdminLayout,
        // meta: { requiresAuth: true, requiresAdmin: true },
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
            {
                path: 'users',
                name: 'AdminUsers',
                component: () => import('../views/admin/UserList.vue'),
            },
            {
                path: 'packages',
                name: 'AdminPackages',
                component: () => import('../views/admin/PackageManagement.vue'),
            },
            {
                path: 'gallery',
                name: 'AdminGallery',
                component: () => import('../views/admin/GalleryManagement.vue')
            }
        ],
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// --- NAVIGATION GUARD ---
router.beforeEach((to, from, next) => {
    // Pastikan auth store diambil setiap kali navigasi
    const authStore = useAuthStore()

    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
    const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

    // Butuh login tapi belum login
    if (requiresAuth && !authStore.isLoggedIn) {
        authStore.returnUrl = to.fullPath
        if (to.path.startsWith('/admin')) {
            next('/admin/login')
        } else {
            next('/login')
        }
    }
    // Butuh admin tapi user bukan admin
    else if (requiresAdmin && !authStore.isAdmin) {
        next('/')
    }
    // Sudah login tapi masuk halaman tamu (login/register)
    else if (authStore.isLoggedIn && requiresGuest) {
        next(authStore.isAdmin ? '/admin/dashboard' : '/')
    }
    // Aman
    else {
        next()
    }
})

export default router
