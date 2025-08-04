const Order = require("../models/Order");
const Razorpay = require("razorpay");
const crypto = require("crypto");

require("dotenv").config(); // Load environment variables
// console.log("Razorpay Key ID:", process.env.RAZORPAY_KEY_ID);
// console.log("Razorpay Key Secret:", process.env.RAZORPAY_KEY_SECRET);

// Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,     // e.g., rzp_live_XXXXX
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
exports.createRazorpayOrder = async (req, res) => {
    try {
        const { total, currency } = req.body;

        const options = {
            amount: 500, // Amount in paise
            currency: currency,
            receipt: `receipt_${Date.now()}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        res.status(201).json({
            message: "Razorpay order created successfully",
            orderId: razorpayOrder.id,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating Razorpay order, please try again later" });
    }
};

// Verify Razorpay payment
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            user,
            item,
            address,
            paymentMode,
            total,
            paymentDetails,
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Invalid payment signature" });
        }

        // Save order to the database only after payment is verified
        const order = new Order({
            user,
            item,
            address,
            paymentMode,
            total,
            paymentDetails,
            paymentStatus: "Success",
            paymentId: razorpay_payment_id,
        });

        await order.save();

        res.status(200).json({ message: "Payment verified successfully", order });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error verifying payment, please try again later" });
    }
};

// CRUD operations for orders
exports.create = async (req, res) => {
    try {
        const created = new Order(req.body);
        await created.save();
        res.status(201).json(created);
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ message: "Error creating an order, please try again later" });
    }
};

const moment = require("moment"); // Import moment.js for easier date manipulation (optional)

exports.getByUserId = async (req, res) => {
    try {
        const { id } = req.params;

        // Calculate the date 6 months ago from today
        const sixMonthsAgo = moment().subtract(6, 'months').toDate();

        // Fetch orders where 'user' matches 'id' and createdAt is within the last 6 months
        const results = await Order.find({
            user: id,
            createdAt: { $gte: sixMonthsAgo } // Filter orders created after sixMonthsAgo
        });

        res.status(200).json(results);
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ message: "Error fetching orders, please try again later" });
    }
};


exports.getAll = async (req, res) => {
    try {
        let skip = 0;
        let limit = 0;

        // Initialize query object
        let searchQuery = {};

        // If searchId is provided, filter by searchId
        if (req.query.searchId) {
            searchQuery._id = req.query.searchId; // Assuming searchId corresponds to the order's _id field
        }

        // If filterStatus is provided, filter by status
        if (req.query.filterStatus) {
            searchQuery.status = req.query.filterStatus; // Filter by status field in DB
        }

        // If pagination parameters are present
        if (req.query.page && req.query.limit) {
            const pageSize = parseInt(req.query.limit);
            const page = parseInt(req.query.page);
            skip = pageSize * (page);  // Correcting to start the skip from the correct position
            limit = pageSize;
        }

        // Set up sorting based on sortOrder
        let sortQuery = {};
        if (req.query.sortOrder) {
            const order = req.query.sortOrder === "desc" ? -1 : 1; // -1 for descending, 1 for ascending
            sortQuery.createdAt = order; // Assuming you want to sort by createdAt field
        }

        // Total number of orders after applying search filter
        const totalDocs = await Order.find(searchQuery).countDocuments().exec();
        
        // Fetch results with applied filters, pagination, and sorting
        const results = await Order.find(searchQuery)
            .skip(skip)
            .limit(limit)
            .sort(sortQuery) // Sorting based on sortOrder
            .exec();

        // Send total count as a header for pagination
        res.header("X-Total-Count", totalDocs);
        res.status(200).json(results);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching orders, please try again later" });
    }
};




exports.updateById = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Order.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(updated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating order, please try again later" });
    }
};
