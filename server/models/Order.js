import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity cannot be less than 1"],
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    orderDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Optional: Add index for faster reporting by date
orderSchema.index({ orderDate: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;