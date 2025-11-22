const db = require('../../config/database');

exports.getRiwayatBooking = async (req, res, next) => {
    try {
        const userId = req.user.user_id;

        const q = `
            SELECT 
                b.booking_id AS id,
                p.package_name AS serviceName,
                br.branch_name AS location,
                b.start_time,
                b.end_time,
                b.total_price AS price,
                b.unique_code,
                b.payment_status AS status,
                b.created_at AS date
            FROM phourto.bookings b
            LEFT JOIN phourto.packages p 
                ON b.package_id = p.package_id
            LEFT JOIN phourto.rooms r
                ON b.room_id = r.room_id
            LEFT JOIN phourto.branches br
                ON r.branch_id = br.branch_id
            WHERE b.user_id = $1
            ORDER BY b.created_at DESC
        `;

        const result = await db.query(q, [userId]);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (err) {
        next(err);
    }
};
