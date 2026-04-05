import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addOrder,
  getOrders,
  getMyOrders,
  deleteOrder,
} from "../controllers/orderController.js";

const router = express.Router();

/**
 * ==============================
 * CUSTOMER ROUTES
 * ==============================
 */

// Place new order
// POST /api/orders/add
router.post("/add", authMiddleware, addOrder);

// Get logged-in customer's orders
// GET /api/orders/my
router.get("/my", authMiddleware, getMyOrders);

/**
 * ==============================
 * ADMIN ROUTES
 * ==============================
 */

// Get all orders (admin)
// GET /api/orders/all
router.get("/all", authMiddleware, getOrders);

// Delete order (admin)
// DELETE /api/orders/:id
router.delete("/:id", authMiddleware, deleteOrder);

export default router;
