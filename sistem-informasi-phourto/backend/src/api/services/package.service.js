const db = require('../../config/database');

class PackageService {
    async getAllPackages() {
        const result = await db.query('SELECT * FROM phourto.packages ORDER BY id ASC');
        return result.rows;
    }
}

module.exports = new PackageService();