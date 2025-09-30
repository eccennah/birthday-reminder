// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const nodemailer = require("nodemailer");

const routes = require("./userRoutes");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", routes);

// Root route
app.get("/", (req, res) => {
  res.send("🎉 Birthday Wisher Backend Running 🚀");
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail", // or "hotmail", etc
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // generated app password
  },
});

// Send birthday email
async function sendBirthdayEmail(to, subject, text, html) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}:`, err.message);
  }
}

// Cron job — runs daily at 7 AM
cron.schedule("0 7 * * *", async () => {
  console.log("⏰ Running birthday check...");

  const now = new Date();
  const mm = now.getMonth();
  const dd = now.getDate();

  try {
    const users = await User.find();
    const todays = users.filter((u) => {
      const dob = new Date(u.dateOfBirth);
      return dob.getDate() === dd && dob.getMonth() === mm;
    });

    if (todays.length === 0) {
      console.log("🎂 No birthdays today");
      return;
    }

    for (const u of todays) {
      await sendBirthdayEmail(
        u.email,
        "🎉 Happy Birthday!",
        `Happy Birthday, ${u.username}! 🎂`,
        `<h1>🎉 Happy Birthday, ${u.username}!</h1><p>Wishing you joy, success and happiness today!</p>`
      );
    }
  } catch (err) {
    console.error("❌ Cron error:", err);
  }
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
