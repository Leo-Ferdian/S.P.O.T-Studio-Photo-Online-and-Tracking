// Tujuan: Menjadi "sumber kebenaran" (single source of truth) untuk
// semua nilai ENUM yang kita definisikan di database V1.9.

/**
 * Status Pesanan (dari phourto.booking_status_enum V1.7)
 * Digunakan oleh:
 * - booking.validator.js
 * - booking.service.js
 */
const BOOKING_STATUS = {
    PENDING: 'PENDING',
    PAID_DP: 'PAID-DP',
    PAID_FULL: 'PAID-FULL',
    EXPIRED: 'EXPIRED',
    CANCELLED: 'CANCELLED',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED'
};

/**
 * Peran Pengguna (dari phourto.user_role_enum V1.8)
 * Digunakan oleh:
 * - admin.middleware.js
 * - user.validator.js (Admin)
 * - auth.service.js
 */
const USER_ROLES = {
    ADMIN: 'admin',
    CUSTOMER: 'customer'
};

/**
 * Tipe Aksi Jejak Audit (dari phourto.booking_action_enum V1.6)
 * Digunakan oleh:
 * - booking.service.js
 * - photo.service.js
 */
const BOOKING_ACTIONS = {
    CREATED: 'CREATED',
    STATUS_CHANGED: 'STATUS_CHANGED',
    PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
    RESCHEDULED: 'RESCHEDULED',
    DETAILS_UPDATED: 'DETAILS_UPDATED',
    PHOTOS_UPLOADED: 'PHOTOS_UPLOADED' // <-- Kita tambahkan ini di V1.10
};


module.exports = {
    BOOKING_STATUS,
    USER_ROLES,
    BOOKING_ACTIONS
};
