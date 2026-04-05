import Supplier from "../models/Supplier.js";
import ProductModel from '../models/Product.js'

export const addSupplier = async (req, res) => {
  try {
    const { name, email, number, address } = req.body;

    // Basic validation
    if (!name || !number) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required",
      });
    }

    // Check existing supplier (by phone or email)
    const existingSupplier = await Supplier.findOne({
      $or: [{ number }, { email }],
    });

    if (existingSupplier) {
      return res.status(400).json({
        success: false,
        message: "Supplier already exists",
      });
    }

    const newSupplier = new Supplier({
      name,
      email,
      number,
      address,
    });

    await newSupplier.save();

    return res.status(201).json({
      success: true,
      message: "Supplier added successfully",
      supplier: newSupplier, // ✅ fixed key
    });
  } catch (error) {
    console.error("Error adding supplier:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        return res.status(200).json({ success: true, suppliers });
    } catch (error) {
        console.error("Error fetching suppliers", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, number, address } = req.body;

        const existingSupplier = await Supplier.findById(id);
        if (!existingSupplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found",
            });
        }

        const updateSupplier = await Supplier.findByIdAndUpdate(
            id,
            { name, email, number, address },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Supplier updated successfully",
        });
    } catch (error) {
        console.error("Error updating Supplier", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const deleteSupplier = async(req, res) => {
    try{
        const {id} = req.params;

        const productCount = await ProductModel.countDocuments({supplier: id});
        if(productCount > 0){
          return res.status(400).json({success: false, message: 'Can not delete supplier associated with products.'});
        }

        const existingSupplier = await Supplier.findById(id);
        if(!existingSupplier){
            return res.status(404).json({success: false, message: 'Supplier not found'});
        }
        await Supplier.findByIdAndDelete(id);
        return res.status(200).json({success: true, message: 'Supplier deleted successfully'});
    } catch (error){
        console.error('Error deleting Supplier', error);
        return res.status(500).json({success: false, message: 'Server error'});
    }
}