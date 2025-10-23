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
        path: '/booking/confirm', // Rute baru untuk halaman konfirmasi
        name: 'BookingConfirmation',
        component: () => import('../views/booking/Confirmation.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/framecatalog',
        name: 'framecatalog',
        component: () => import('../views/framecatalog.vue'),
    },
    {
        path: '/booking/:branchSlug/:packageId', // Rute baru untuk halaman booking
        name: 'BookingAppointment',
        component: () => import('../views/booking/BookingAppointment.vue'),
        props: true, // Mengirimkan `branchSlug` & `packageId` sebagai prop
        meta: { requiresAuth: true } // Halaman ini butuh login
    },
    {
        path: '/booking/success', // Rute untuk halaman sukses/verifikasi
        name: 'BookingSuccess',
        component: () => import('../views/booking/Success.vue'),
        meta: { requiresAuth: true }
    },
    // Grup rute untuk admin
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
            {
                path: 'users',
                name: 'AdminUsers',
                component: () => import('../views/admin/UserList.vue'), // Pastikan ini ada
            },
            {
                path: 'packages',
                name: 'AdminPackages',
                component: () => import('../views/admin/PackageManagement.vue'), // Pastikan ini ada
            },
            {
                path: '/admin/login', // Rute khusus login admin
                name: 'AdminLogin',
                component: () => import('../views/auth/AdminLogin.vue'), // Komponen baru
            },
            // Tambahkan rute admin lain di sini (bookings, packages, dll.)
        ]
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// router.beforeEach((to, from, next) => {
//     const authStore = useAuthStore();
//     const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
//     const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
//     const isAdminLoginPage = to.name === 'AdminLogin';

//     // Jika mencoba akses halaman yg butuh login tapi belum login
//     if (requiresAuth && !authStore.isLoggedIn) {
//         // Arahkan ke login admin jika tujuannya adalah area admin
//         if (to.path.startsWith('/admin')) {
//             next('/admin/login');
//         } else {
//             next('/login'); // Arahkan ke login customer biasa
//         }
//     }
//     // Jika mencoba akses halaman yg butuh admin tapi bukan admin
//     else if (requiresAdmin && !authStore.isAdmin) {
//         next('/'); // Alihkan ke halaman utama
//     }
//     // Jika SUDAH login dan mencoba akses halaman login (admin atau customer)
//     else if (authStore.isLoggedIn && (to.name === 'Login' || isAdminLoginPage)) {
//          // Jika admin, arahkan ke dashboard admin, jika customer, ke dashboard customer
//         next(authStore.isAdmin ? '/admin/dashboard' : '/dashboard');
//     }
//     // Jika semua kondisi aman
//     else {
//         next();
//     }
// });

export default router;