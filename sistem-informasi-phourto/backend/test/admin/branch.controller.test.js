const AdminBranchController = require('../../src/api/controllers/admin/branch.controller');
const apiResponse = require('../../src/utils/apiResponse');
const apiError = require('../../src/utils/apiError');
const { validationResult } = require('express-validator');

// Mock semua dependensi eksternal
jest.mock('../../src/utils/apiResponse');
jest.mock('../../src/utils/apiError');
jest.mock('express-validator', () => ({
    validationResult: jest.fn(),
}));

// Helper untuk mock req dan res
const mockReq = (data = {}) => ({
    body: data.body || {},
    params: data.params || {},
    query: data.query || {},
});

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('AdminBranchController Unit Test', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // =====================================================================
    // GET ALL BRANCHES
    // =====================================================================
    test('getAllBranches() → harus mengembalikan semua cabang', async () => {
        const req = mockReq();
        const res = mockRes();

        apiResponse.mockImplementation((res, status, data, message) => {
            res.status(status).json({ data, message });
        });

        await AdminBranchController.getAllBranches(req, res);

        expect(apiResponse).toHaveBeenCalledWith(
            res,
            200,
            [{ id: 1, name: "Cabang Pusat" }],
            'Semua cabang berhasil diambil.'
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    // =====================================================================
    // CREATE BRANCH
    // =====================================================================
    test('createBranch() → berhasil membuat cabang baru jika validasi lolos', async () => {
        const req = mockReq({ body: { name: "Cabang Baru" } });
        const res = mockRes();

        validationResult.mockReturnValue({ isEmpty: () => true });
        apiResponse.mockImplementation((res, status, data, message) => {
            res.status(status).json({ data, message });
        });

        await AdminBranchController.createBranch(req, res);

        expect(apiResponse).toHaveBeenCalledWith(
            res,
            201,
            { id: 2, name: "Cabang Baru" },
            'Cabang baru berhasil dibuat.'
        );
        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('createBranch() → gagal jika validasi gagal', async () => {
        const req = mockReq({ body: {} });
        const res = mockRes();

        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: 'Nama wajib diisi' }],
        });

        apiError.mockImplementation((status, message, errors) => ({
            status, message, errors
        }));

        await expect(AdminBranchController.createBranch(req, res))
            .rejects
            .toEqual({
                status: 400,
                message: 'Validasi gagal.',
                errors: [{ msg: 'Nama wajib diisi' }],
            });
    });

    // =====================================================================
    // GET BRANCH BY ID
    // =====================================================================
    test('getBranchById() → berhasil mengambil detail cabang', async () => {
        const req = mockReq({ params: { id: 1 } });
        const res = mockRes();

        validationResult.mockReturnValue({ isEmpty: () => true });
        apiResponse.mockImplementation((res, status, data, message) => {
            res.status(status).json({ data, message });
        });

        await AdminBranchController.getBranchById(req, res);

        expect(apiResponse).toHaveBeenCalledWith(
            res,
            200,
            { id: 1, name: "Cabang Detail" },
            'Detail cabang berhasil diambil.'
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    // =====================================================================
    // UPDATE BRANCH
    // =====================================================================
    test('updateBranch() → berhasil memperbarui cabang', async () => {
        const req = mockReq({ params: { id: 1 }, body: { name: "Cabang Edit" } });
        const res = mockRes();

        validationResult.mockReturnValue({ isEmpty: () => true });
        apiResponse.mockImplementation((res, status, data, message) => {
            res.status(status).json({ data, message });
        });

        await AdminBranchController.updateBranch(req, res);

        expect(apiResponse).toHaveBeenCalledWith(
            res,
            200,
            { id: 1, name: "Cabang Edit" },
            'Cabang berhasil diperbarui.'
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    // =====================================================================
    // DELETE BRANCH
    // =====================================================================
    test('deleteBranch() → berhasil menghapus cabang', async () => {
        const req = mockReq({ params: { id: 1 } });
        const res = mockRes();

        validationResult.mockReturnValue({ isEmpty: () => true });
        apiResponse.mockImplementation((res, status, data, message) => {
            res.status(status).json({ data, message });
        });

        await AdminBranchController.deleteBranch(req, res);

        expect(apiResponse).toHaveBeenCalledWith(
            res,
            200,
            null,
            'Cabang berhasil dihapus.'
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
