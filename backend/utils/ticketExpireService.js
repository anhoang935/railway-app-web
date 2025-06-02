import pool from '../Config/db.js';
import cron from 'node-cron';

cron.schedule('*/5 * * * *', async () => {
    try {
        const [result] = await pool.query(
            `
            DELETE t FROM ticket t
            LEFT JOIN booking b
                ON t.bookingID = b.bookingID 
            WHERE t.expire_date_time IS NOT NULL 
                AND t.expire_date_time < NOW() 
                AND b.status = 'pending'
            `
        );
        console.log(`${result.affectedRows} expired ticket(s) deleted`);
    } catch (err) {
        console.error('Error deleting expired tickets:', err);
    }
});
