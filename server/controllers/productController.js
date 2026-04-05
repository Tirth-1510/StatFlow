import Supplier from "../models/Supplier.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import xlsx from "xlsx";
import fs from "fs";

/* ================= ADD PRODUCT (MANUAL) ================= */
export const addProduct = async (req, res) => {
  try {
    const { name, description, price, stock, lowStockLimit, category, supplier } = req.body;

    if (!name || price === undefined || !category || !supplier) {
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    const normalizedCategory = category.toString().trim();
    const normalizedSupplier = supplier.toString().trim();

    // Upsert Category
    const categoryDoc = await Category.findOneAndUpdate(
      { categoryName: { $regex: new RegExp(`^${normalizedCategory}$`, 'i') } },
      { categoryName: normalizedCategory, categoryDescription: "Auto-generated" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Upsert Supplier
    const supplierDoc = await Supplier.findOneAndUpdate(
      { name: { $regex: new RegExp(`^${normalizedSupplier}$`, 'i') } },
      { name: normalizedSupplier },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const newProduct = await Product.create({
      name: name.trim(),
      description,
      price: Number(price),
      stock: Number(stock) || 0,
      lowStockLimit: Number(lowStockLimit) || 10, // ✅ Added product-specific limit
      category: categoryDoc._id,
      supplier: supplierDoc._id,
      isDeleted: false,
    });

    const populatedProduct = await Product.findById(newProduct._id).populate("category supplier");

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: populatedProduct,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= GET PRODUCTS ================= */
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: false })
      .populate("category")
      .populate("supplier")
      .sort({ createdAt: -1 });

    const suppliers = await Supplier.find().sort({ name: 1 });
    const categories = await Category.find().sort({ categoryName: 1 });

    return res.status(200).json({
      success: true,
      products,
      suppliers,
      categories,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= UPDATE PRODUCT ================= */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, lowStockLimit, category, supplier } = req.body;

    let updateData = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (lowStockLimit !== undefined) updateData.lowStockLimit = Number(lowStockLimit); // ✅ Update limit

    if (category) {
      const normalizedCat = category.toString().trim();
      const categoryDoc = await Category.findOneAndUpdate(
        { categoryName: { $regex: new RegExp(`^${normalizedCat}$`, 'i') } },
        { categoryName: normalizedCat },
        { upsert: true, new: true }
      );
      updateData.category = categoryDoc._id;
    }

    if (supplier) {
      const normalizedSup = supplier.toString().trim();
      const supplierDoc = await Supplier.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${normalizedSup}$`, 'i') } },
        { name: normalizedSup },
        { upsert: true, new: true }
      );
      updateData.supplier = supplierDoc._id;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true })
      .populate("category")
      .populate("supplier");

    return res.status(200).json({ success: true, message: "Updated successfully", product: updatedProduct });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= DELETE PRODUCT ================= */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Product permanently removed. Dashboard metrics updated.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= BULK UPLOAD PRODUCTS ================= */
export const bulkUploadProducts = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const filePath = req.file.path;
    let productsData = [];

    if (req.file.mimetype === "application/json") {
      productsData = JSON.parse(fs.readFileSync(filePath));
    } else {
      const workbook = xlsx.readFile(filePath);
      productsData = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    }

    const formattedProducts = [];

    for (let item of productsData) {
      if (!item.name || item.price === undefined || !item.category || !item.supplier) continue;

      const categoryName = item.category.toString().trim();
      const supplierName = item.supplier.toString().trim();

      const categoryDoc = await Category.findOneAndUpdate(
        { categoryName: { $regex: new RegExp(`^${categoryName}$`, 'i') } },
        { categoryName, categoryDescription: "Bulk Uploaded" },
        { upsert: true, new: true }
      );

      const supplierDoc = await Supplier.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${supplierName}$`, 'i') } },
        { 
          name: supplierName, 
          email: item.supplierEmail || item.email || "bulk@upload.com", 
          number: item.supplierPhone || item.number || item.phone || "N/A", 
          address: item.supplierAddress || item.address || "N/A" 
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      formattedProducts.push({
        name: item.name.toString().trim(),
        description: item.description || "",
        price: Number(item.price),
        stock: Number(item.stock) || 0,
        lowStockLimit: Number(item.lowStockLimit) || 10, // ✅ Support limit in bulk upload
        category: categoryDoc._id,
        supplier: supplierDoc._id,
        isDeleted: false,
      });
    }

    if (formattedProducts.length > 0) {
      await Product.insertMany(formattedProducts);
    }

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    return res.status(201).json({
      success: true,
      message: `Successfully imported ${formattedProducts.length} products.`,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(500).json({ success: false, message: error.message });
  }
};