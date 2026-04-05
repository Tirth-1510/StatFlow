import OrderModel from "../models/Order.js";
import Product from "../models/Product.js";

const getData = async (req, res) => {
    try {
        const now = new Date();
        
        // Define Date Boundaries (Start of day in local time)
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        // Run all queries in parallel
        const [
            totalProducts,
            stockResult,
            orderToday,
            revenueResult,
            outOfStock,
            highestSaleResult,
            lowStock,
            dailySalesRaw,
            monthlySalesRaw
        ] = await Promise.all([
            // 1. Total Count
            Product.countDocuments(),

            // 2. Total Stock aggregation
            Product.aggregate([
                { $group: { _id: null, totalStock: { $sum: "$stock" } } }
            ]),

            // 3. Orders placed today
            OrderModel.countDocuments({
                orderDate: { $gte: startOfToday }
            }),

            // 4. Lifetime Total Revenue
            OrderModel.aggregate([
                { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
            ]),

            // 5. Out of Stock List
            Product.find({ stock: 0 })
                .select('name stock')
                .populate('category', 'categoryName'),

            // 6. Highest Sale Product logic
            OrderModel.aggregate([
                { $group: { _id: '$product', totalQuantity: { $sum: '$quantity' } } },
                { $sort: { totalQuantity: -1 } },
                { $limit: 1 },
                { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'p' } },
                { $unwind: { path: '$p', preserveNullAndEmptyArrays: false } },
                { $lookup: { from: 'categories', localField: 'p.category', foreignField: '_id', as: 'c' } },
                { $unwind: { path: '$c', preserveNullAndEmptyArrays: true } },
                { $project: { name: '$p.name', category: '$c.categoryName', totalQuantity: 1 } }
            ]),

            // 7. Low Stock List (Dynamic comparison with product-specific limit)
            Product.find({
                $expr: {
                    $and: [
                        { $gt: ["$stock", 0] }, // Item is not completely out of stock
                        { $lt: ["$stock", "$lowStockLimit"] } // Item is below its specific limit
                    ]
                }
            })
                .select('name stock lowStockLimit')
                .populate('category', 'categoryName'),

            // 8. Daily Sales (Fill missing days with 0)
            OrderModel.aggregate([
                { $match: { orderDate: { $gte: startOfMonth } } },
                {
                    $group: {
                        _id: { $dayOfMonth: "$orderDate" },
                        total: { $sum: "$totalPrice" }
                    }
                }
            ]),

            // 9. Monthly Sales (Fill missing months with 0)
            OrderModel.aggregate([
                { $match: { orderDate: { $gte: startOfYear } } },
                {
                    $group: {
                        _id: { $month: "$orderDate" },
                        total: { $sum: "$totalPrice" }
                    }
                }
            ])
        ]);

        // Helper: Ensure every day of the current month is present in graph
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const dailySales = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const found = dailySalesRaw.find(d => d._id === day);
            return { _id: day, total: found ? found.total : 0 };
        });

        // Helper: Ensure every month of the year is present in graph
        const monthlySales = Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            const found = monthlySalesRaw.find(m => m._id === month);
            return { _id: month, total: found ? found.total : 0 };
        });

        const dashboardData = {
            totalProducts,
            totalStock: stockResult[0]?.totalStock || 0,
            orderToday,
            revenue: revenueResult[0]?.totalRevenue || 0,
            outOfStock,
            highestSaleProduct: highestSaleResult[0] || null,
            lowStock,
            dailySales, 
            monthlySales 
        };

        return res.status(200).json({ 
            success: true, 
            dashboardData 
        });

    } catch (error) {
        console.error("Dashboard API Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error while generating dashboard metrics" 
        });
    }
}

export { getData };