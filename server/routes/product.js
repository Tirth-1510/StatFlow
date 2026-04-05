import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import isAdmin from '../middleware/isAdmin.js'; 
import upload from '../middleware/multer.js'; 
import { 
    getProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    bulkUploadProducts 
} from '../controllers/productController.js';

const router = express.Router();

/* ================= PRODUCT ROUTES ================= */

// ✅ GET Products: Accessible by both Admin and Customer 
// (Necessary so Customers can see Category Names)
router.get('/', authMiddleware, getProducts);

// 🔒 PROTECTED: Only Admins can modify the inventory
router.post('/add', authMiddleware, isAdmin, addProduct);
router.put('/:id', authMiddleware, isAdmin, updateProduct);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);

/* ================= BULK UPLOAD ROUTE ================= */
/**
 * Only Admins can perform bulk imports.
 * The 'file' key must match the one used in your React BulkUploadModal.
 */
router.post(
    '/bulk-upload', 
    authMiddleware, 
    isAdmin, 
    upload.single('file'), 
    bulkUploadProducts
);

export default router;