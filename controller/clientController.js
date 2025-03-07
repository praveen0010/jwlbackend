const asyncHandler = require("express-async-handler");
const Client = require("../models/clientSchema");
const Payment = require("../models/paymentSchema");
const Razorpay = require("razorpay");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const nodemailer = require("nodemailer");

const instance = new Razorpay({
  key_id: "rzp_test_EHcuieW86Ce5O5", // Replace with your Razorpay API Key
  key_secret: "lYLxGDazuhZ4iPkZBRSZrU0y", // Replace with your Razorpay Secret Key
});

const getPaymentDetails = async (payid) => {
  try {
    const razorpay_payment_id = payid;
    const payment = await instance.payments.fetch(razorpay_payment_id);
    return {
      paymentStatus: payment.status,
      method: payment.method,
      id: payment.id,
    };
  } catch (error) {
    return false;
  }
};

const createClient = asyncHandler(async (req, res) => {
  const {
    userid,
    name,
    amount,
    paymentId,
    email,
    phone_number,
    select_type,
    schemes,
  } = req?.body?.formData;

  if (paymentId === "") {
    res.status(400);
    throw new Error("Payment ID Is Required...");
  }
  const { paymentStatus, method, id } = await getPaymentDetails(paymentId);
  if (!paymentStatus) {
    res.status(400);
    throw new Error("Invalid Payment Details...");
  }
  //   const paymetdata = {
  //     name,
  //     amount,
  //     paymentId,
  //     email,
  //     phone_number,
  //     method,
  //     id,
  //   };

  const newClient = await Client.create({
    userid: userid,
    name: name,
    amount: amount,
    email: email,
    phone_number: phone_number,
    select_type: select_type,
    schemes: schemes,
    paymentId: paymentId,
    paymentStatus: paymentStatus,
  });
  console.log(newClient);

  if (newClient) {
    //    await generateReceipttttt(newClient);
    try {
      if (newClient) {
        await generateReceipttttt(newClient);
      }
    } catch (error) {
      res.status(400);
      throw new Error("Mail Send Error");
    }
    res.status(200).json({ _id: newClient.id, name: newClient.name });
  } else {
    res.status(400);
    throw new Error("Client data is not valid");
  }
});

const getClients = asyncHandler(async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (error) {
    console.log("Error Fetching Clients", error);
    res.status(500).json({ message: "Server Error" });
  }
});

const getCltDtl = asyncHandler(async (req, res) => {
  try {
    let { page, limit, sortBy, sortOrder } = req.query;

    // Default values if parameters are not provided
    page = parseInt(page) || 1; // Default: Page 1
    limit = parseInt(limit) || 100; // Default: 20 records per page
    sortBy = sortBy || "createdAt"; // Default sorting field is 'createdAt'
    sortOrder = sortOrder === "desc" ? -1 : 1; // Default: ascending order

    const skip = (page - 1) * limit; // Calculate how many records to skip

    // Fetch clients with sorting, skipping, and limiting records
    const clients = await Client.find()
      .sort({ [sortBy]: sortOrder }) // Dynamic sorting
      .skip(skip) // Skip records for pagination
      .limit(limit); // Limit the number of results

    res.json(clients);
  } catch (error) {
    console.log("Error Fetching Clients", error);
    res.status(500).json({ message: "Server Error" });
  }
});

const deleteAll = asyncHandler(async (req, res) => {
  try {
    const result = await Client.deleteMany({}); // Deletes all clients

    res.json({
      message: `${result.deletedCount} clients deleted successfully`,
    });
  } catch (error) {
    console.log("Error Deleting Clients", error);
    res.status(500).json({ message: "Server Error" });
  }
});

const getclientfilters = asyncHandler(async (req, res) => {
  try {
    const { fromDate, toDate } = req.query; // Expecting 'DD-MM-YYYY' format

    console.log("Received Dates => From:", fromDate, "To:", toDate);

    let filter = {}; // Default filter (empty if no dates are provided)

    if (fromDate && toDate) {
      const [fromDay, fromMonth, fromYear] = fromDate.split("-");
      const [toDay, toMonth, toYear] = toDate.split("-");

      if (
        !fromDay ||
        !fromMonth ||
        !fromYear ||
        !toDay ||
        !toMonth ||
        !toYear
      ) {
        return res
          .status(400)
          .json({ message: "Invalid date format. Expected DD-MM-YYYY" });
      }

      // Convert to proper Date format
      const startDate = new Date(
        `${fromYear}-${fromMonth}-${fromDay}T00:00:00.000Z`
      );
      const endDate = new Date(`${toYear}-${toMonth}-${toDay}T23:59:59.999Z`);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error("❌ Invalid Date Conversion:", { startDate, endDate });
        return res.status(400).json({
          message: "Invalid date provided. Expected format: DD-MM-YYYY",
        });
      }

      console.log("Parsed Start Date:", startDate.toISOString());
      console.log("Parsed End Date:", endDate.toISOString());

      filter.createdAt = { $gte: startDate, $lte: endDate };
    }

    console.log("MongoDB Filter:", JSON.stringify(filter));

    // Fetch records based on filter
    const clients = await Client.find(filter).sort({ createdAt: -1 });

    res.json(clients);
  } catch (error) {
    console.error("Error Fetching Clients:", error);
    next(error); // Pass error to Express error handler
  }
});

/////////////////

// Function to generate a payment receipt
const generateReceipt = (paymentData, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    ///////////////////////////////////////
    // Define Header Section (Background Container)
    const headerX = 50; // X position
    const headerY = 50; // Y position
    const headerWidth = 500; // Width of container
    const headerHeight = 70; // Height of container

    // Draw the header background
    doc.rect(headerX, headerY, headerWidth, headerHeight).fill("#00a156"); // Black background

    // Add Logo (Inside Header Container)
    //
    const logoPath = __dirname + "/../Assets/logo.png"; // Adjust path as needed
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, headerX + 10, headerY + 10, {
        width: 90,
        height: 50,
      }); // Logo inside container
    }

    // Add Title (Inside Header Container)
    doc
      .fillColor("#FFFFFF") // Set text color to white
      .fontSize(30)
      .text("Salem Jewellery", headerX + 70, headerY + 25, { align: "center" });

    // Reset fill color for normal text
    doc.fillColor("#000000");
    // Header
    doc.moveDown();
    doc.fontSize(20).text("PAYMENT RECEIPT", { align: "center" }).moveDown();
    doc.moveDown();
    // Payment Info
    doc.fontSize(12).text(`Transaction ID: ${paymentData.paymentId}`);
    doc.moveDown();
    doc.text(`Payment Date: ${new Date()}`);
    doc.moveDown();
    //doc.text(`Payment Method: ${paymentData.method}`);
    doc.text(`Paid By: ${paymentData.name}`);
    doc.moveDown();
    doc.text(`Contact: ${paymentData.phone_number}`);
    doc.moveDown();
    doc.text(`Plan: ${paymentData.select_type}`);
    doc.moveDown();
    doc.text(`Grm/Amt: ${paymentData.schemes}`);
    doc.moveDown();
    doc.text(`Email: ${paymentData.email}`);
    doc.moveDown();
    // Amount
    doc.text(`Amount Paid: ${paymentData.amount}`, {
      align: "right",
    });
    doc.moveDown(4);

    // Footer
    doc.fontSize(14).text("Thank you for your payment!", { align: "center" });

    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
  });
};

// Send Receipt via Email
const sendReceiptEmail = async (email, filePath) => {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.SEND_EMAIL,
      pass: process.env.SEND_EMAIL_PASS,
    },

    // service: "gmail",
    // auth: {
    //   user: "your-email@gmail.com",
    //   pass: "your-email-password", // Use environment variables
    // },
  });

  let mailOptions = {
    from: "sdmedia.connect@gmail.com",
    to: email,
    subject: "Your Payment Receipt",
    text: "Thank you for your payment. Please find your receipt attached.",
    attachments: [{ filename: "receipt.pdf", path: filePath }],
  };

  await transporter.sendMail(mailOptions);
  console.log("Receipt sent via email!");
};

//API to generate and send receipt

const generateReceipttttt = async (paymentData) => {
  const filePath = `receipt-${paymentData.paymentId}.pdf`;
  try {
    await generateReceipt(paymentData, filePath);
    await sendReceiptEmail(paymentData.email, filePath);

    // res.json({ message: "Receipt generated and emailed successfully!" });

    // Delete the file after sending
    setTimeout(() => fs.unlinkSync(filePath), 3000);
  } catch (error) {
    //res.status(500).json({ error: "Failed to generate receipt" });
    console.log(error);
  }
};
// app.post("/generate-receipt", async (req, res) => {

// });

//API to download receipt
// app.get("/download-receipt/:transactionId", (req, res) => {
//   const filePath = `receipt-${req.params.transactionId}.pdf`;
//   if (fs.existsSync(filePath)) {
//     res.download(filePath, "receipt.pdf", () => {
//       setTimeout(() => fs.unlinkSync(filePath), 5000);
//     });
//   } else {
//     res.status(404).json({ error: "Receipt not found" });
//   }
// });
/////////////////

module.exports = {
  createClient,
  getClients,
  getCltDtl,
  deleteAll,
  getclientfilters,
};
