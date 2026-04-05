import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true 
    },
    description: { 
      type: String 
    },
    price: { 
      type: Number, 
      required: true 
    },
    stock: { 
      type: Number, 
      default: 0 
    },
    // ✅ NEW: Product-specific threshold for "Low Stock" alerts
    lowStockLimit: { 
      type: Number, 
      default: 10 
    },
    // ✅ Reference to Category model
    category: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Category", 
      required: true,
    },
    // ✅ Reference to Supplier model
    supplier: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Supplier", 
      required: true,
    },
    isDeleted: { 
      type: Boolean, 
      default: false 
    },
  },
  { timestamps: true }
);

// Add an index for name to help with search performance
productSchema.index({ name: 'text' });

export default mongoose.model("Product", productSchema);