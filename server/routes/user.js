import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import isAdmin from '../middleware/isAdmin.js'; // ✅ Import Admin check
import upload from '../middleware/multer.js'; // ✅ Import Multer config
import { 
    addUser, 
    getUsers, 
    deleteUser, 
    getUser, 
    updateUserProfile, 
    bulkUploadUsers // ✅ Import the new function
} from '../controllers/userController.js';

const router = express.Router();

// Existing Routes
router.post('/add', authMiddleware, isAdmin, addUser); // Added isAdmin for safety
router.get('/', authMiddleware, isAdmin, getUsers);   // Added isAdmin for safety
router.delete('/:id', authMiddleware, isAdmin, deleteUser);
router.get('/profile', authMiddleware, getUser);
router.put('/profile', authMiddleware, updateUserProfile);

/* ================= NEW BULK UPLOAD ROUTE ================= */
/**
 * 1. authMiddleware: Verifies the admin is logged in
 * 2. isAdmin: Verifies the user has 'admin' privileges
 * 3. upload.single('file'): Multer captures the Excel/JSON file
 * 4. bulkUploadUsers: Processes data and hashes passwords
 */
router.post(
    '/bulk-upload', 
    authMiddleware, 
    isAdmin, 
    upload.single('file'), 
    bulkUploadUsers
);

export default router;