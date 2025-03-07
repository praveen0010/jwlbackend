const asyncHandler = require('express-async-handler');
const Prices = require('../models/priceSchema');

const createSchema = asyncHandler(async (req, res) => {
    const { golden, silver,chittu } = req.body;

    const newPrice = await Prices.create({
        golden: golden,
        silver: silver,
        chittu: chittu,
    });
    if (newPrice) {
        res.status(200).json({ _id: newPrice.id, message: "Added successfully" })
    } else {
        res.status(400);
        throw new Error('Admin data is not valid')
    }
});


const getPrices = asyncHandler(async(req, res)=>{
    try {
        const prices = await Prices.find().sort({ createdAt: -1 }); // Sorting by createdAt in descending order
        res.json(prices);
    } catch (error) {
        console.log("Error Fetching Prices", error);
        res.status(500).json({message: 'Server Error'})
    }
});

const getPricesfilter = asyncHandler(async (req, res) => {
    try {
        let { date } = req.query; // Expecting 'date' in 'DD-MM-YYYY' format

        // If no date is provided, use the current date (in DD-MM-YYYY format)
        if (!date) {
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
            const year = now.getFullYear();
            date = `${day}-${month}-${year}`; // Format as 'DD-MM-YYYY'
        }

        // Convert 'DD-MM-YYYY' to a Date range (start & end of the day)
        const [day, month, year] = date.split("-");
        const startDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
        const endDate = new Date(`${year}-${month}-${day}T23:59:59.999Z`);

        // Fetch records filtered by date, sorted in descending order
        const prices = await Prices.find({
            createdAt: { $gte: startDate, $lte: endDate }
        }).sort({ createdAt: -1 }); // Descending order

        res.json(prices);
    } catch (error) {
        console.log("Error Fetching Prices", error);
        res.status(500).json({ message: "Server Error" });
    }
});



module.exports = { createSchema,getPrices,getPricesfilter}
