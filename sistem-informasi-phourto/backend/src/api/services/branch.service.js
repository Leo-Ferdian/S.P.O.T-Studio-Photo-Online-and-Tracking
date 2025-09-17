const db = require('../../config/database');

class BranchService {
    async getAllBranches() {
        const result = await db.query('SELECT * FROM phourto.branches ORDER BY id ASC');
        return result.rows;
    }
}

module.exports = new BranchService();