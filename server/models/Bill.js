import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The order IDs that make up this bill
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],

    // Total bill amount (sum of all order totalPrices)
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // The session/order date this bill represents
    billDate: {
      type: Date,
      required: true,
    },

    // A human-readable bill reference number (set by controller before save)
    billNumber: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Bill = mongoose.model("Bill", billSchema);

export default Bill;
