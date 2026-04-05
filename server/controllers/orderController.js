import Order from "../models/Order.js";
import Product from "../models/Product.js";

/**
 * CREATE ORDER (Status field removed)
 */
const addOrder = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { product, quantity } = req.body;

    if (!product || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: "Product and valid quantity are required" });
    }

    const productData = await Product.findById(product);
    if (!productData) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (productData.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock! Only ${productData.stock} items left.`,
      });
    }

    const totalPrice = productData.price * quantity;

    const newOrder = new Order({
      customer: customerId,
      product,
      quantity,
      totalPrice,
    });

    await newOrder.save();

    await Product.findByIdAndUpdate(product, { $inc: { stock: -quantity } });

    return res.status(201).json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET ALL ORDERS 
 */
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email")
      .populate({
        path: "product",
        populate: { path: "category", select: "categoryName" },
      })
      .sort({ orderDate: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET CUSTOMER ORDERS
 */
const getMyOrders = async (req, res) => {
  try {
    const customerId = req.user._id;
    const orders = await Order.find({ customer: customerId })
      .populate({
        path: "product",
        populate: { path: "category", select: "categoryName" },
      })
      .sort({ orderDate: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * DELETE ORDER
 */
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    await Product.findByIdAndUpdate(order.product, { $inc: { stock: order.quantity } });
    await Order.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: "Order deleted and stock restored" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export { addOrder, getOrders, getMyOrders, deleteOrder };