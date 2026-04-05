import Category from '../models/Category.js';
import ProductModel from '../models/Product.js';
import mongoose from 'mongoose';

const addCategory = async (req, res) => {
    try {
        const { categoryName, categoryDescription } = req.body;

        // FIXED: corrected field name from 'ame' to 'categoryName'
        const existingCategory = await Category.findOne({ categoryName });
        if (existingCategory) {
            return res.status(400).json({ success: false, message: 'Category already exists' });
        }

        const newCategory = new Category({ categoryName, categoryDescription });
        await newCategory.save();
        
        return res.status(201).json({ success: true, message: 'Category added successfully' });
    } catch (error) {
        console.error('Error adding category:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        return res.status(200).json({ success: true, categories });
    } catch (error) {
        console.error("Error fetching categories:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { categoryName, categoryDescription } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID format" });
        }

        // OPTIMIZED: findByIdAndUpdate returns null if not found
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { categoryName, categoryDescription },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category: updatedCategory,
        });
    } catch (error) {
        console.error("Error updating category:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID format" });
        }

        // 2. Integrity Check: Prevent orphaned products
        const productCount = await ProductModel.countDocuments({ category: id });
        if (productCount > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot delete: ${productCount} products are still using this category.` 
            });
        }

        // 3. Execution: Combine Find and Delete
        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        return res.status(200).json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

export { addCategory, getCategories, updateCategory, deleteCategory };