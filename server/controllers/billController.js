import Bill from "../models/Bill.js";
import Order from "../models/Order.js";

/**
 * GENERATE A BILL FROM A SESSION
 * Admin clicks "Generate Bill" on the Orders page for a daily session.
 * Body: { customerId, sessionDate, orderIds }
 */
const generateBill = async (req, res) => {
  try {
    const { customerId, sessionDate, orderIds } = req.body;

    if (!customerId || !sessionDate || !orderIds || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "customerId, sessionDate, and orderIds are required",
      });
    }

    // Prevent generating a bill for an item that has already been billed
    const existingBill = await Bill.findOne({
      customer: customerId,
      orders: { $in: orderIds },
    });

    if (existingBill) {
      return res.status(409).json({
        success: false,
        message: "One or more of the selected items have already been billed.",
      });
    }

    // Fetch orders and compute total
    const orders = await Order.find({ _id: { $in: orderIds } });
    const baseAmount = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalAmount = baseAmount * 1.05; // 5% GST

    // Generate a sequential bill number in the controller (avoids Mongoose hook issues)
    const lastBill = await Bill.findOne().sort({ createdAt: -1 });
    let nextNum = 1;
    if (lastBill && lastBill.billNumber) {
      const match = lastBill.billNumber.match(/\d+$/);
      if (match) {
        nextNum = parseInt(match[0], 10) + 1;
      }
    }
    const billNumber = `BILL-${String(nextNum).padStart(5, "0")}`;

    const newBill = new Bill({
      customer: customerId,
      orders: orderIds,
      totalAmount,
      billDate: new Date(),
      billNumber,
    });

    await newBill.save();

    return res.status(201).json({
      success: true,
      message: "Bill generated and added to Payment Ledger",
      bill: newBill,
    });
  } catch (error) {
    console.error("Error generating bill:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET ALL PENDING BILLS (Admin)
 * Returns all unpaid bills with full customer info, sorted oldest first.
 */
const getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate("customer", "name email address")
      .populate({
        path: "orders",
        populate: { path: "product", select: "name price" },
      })
      .sort({ billDate: 1 }); // oldest first — so overdue bills are at the top

    return res.status(200).json({ success: true, bills });
  } catch (error) {
    console.error("Error fetching bills:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * DELETE / MARK BILL AS PAID (Admin)
 * Removes the bill from the ledger once payment is received.
 */
const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await Bill.findById(id);

    if (!bill) {
      return res.status(404).json({ success: false, message: "Bill not found" });
    }

    await Bill.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Bill marked as paid and removed from ledger",
    });
  } catch (error) {
    console.error("Error deleting bill:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export { generateBill, getAllBills, deleteBill };
