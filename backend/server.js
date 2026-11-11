require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const {
    notFound,
    errorHandler,
} = require("./middleware/errorMiddleware");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://capstonevitalsync.vercel.app"
    ],
}));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/protected", require("./routes/protectedRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));

app.get("/", (req, res) => {
  res.send("VitalSync backend is running");
});

async function startServer(){
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected successfully");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }catch(error){
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
}

// Handle unknown routes
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

startServer();