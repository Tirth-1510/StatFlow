import Express from 'express';
import authMiddlewarre from '../middleware/authMiddleware.js'
import { getData } from '../controllers/dashboardController.js';

const router = Express.Router();

router.get("/", authMiddlewarre, getData);

export default router;