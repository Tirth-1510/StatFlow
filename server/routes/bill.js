import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { generateBill, getAllBills, deleteBill } from "../controllers/billController.js";

const router = express.Router();

// POST /api/bills/generate — Admin generates a bill from a session
router.post("/generate", authMiddleware, generateBill);

// GET /api/bills/all — Admin fetches all pending bills
router.get("/all", authMiddleware, getAllBills);

// DELETE /api/bills/:id — Admin marks a bill as paid (removes from ledger)
router.delete("/:id", authMiddleware, deleteBill);

export default router;
