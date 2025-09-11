const fs = require("fs");
const http = require("http");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const logger = require("./middlewares/logger");
const { ensureUploadTree } = require("./middlewares/upload");

const { otpRoutes } = require("./routes/otpRoute");
const { userRoutes } = require("./routes/userRoute");
const donationRequestRoutes = require("./routes/donationRequestRoute");
const donationRequestConfirmationRoutes = require("./routes/donationRequestConfirmationRoutes");
const donationConfirmationRoutes = require("./routes/donationConfirmationRoutes");
const bloodRequestRoutes = require("./routes/bloodRequestRoute");
const messageRoutes = require("./routes/messageRoute");
const notificationRoutes = require("./routes/notificationRoutes");

const setupSocket = require("./socket");

dotenv.config();
ensureUploadTree();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,
  },
  transports: ["websocket", "polling"],
});
app.set("io", io);

/* Middlewares */
app.use(cors());
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));
app.use(logger);

/* alias قديم للتوافق */
app.use("/donations", (req, res, next) => {
  const file = req.path.replace(/^\/+/, "");
  req.url = `/donationRequests/${file}`;
  next();
});

/* Static uploads */
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use(
  "/uploads",
  express.static(uploadsDir, {
    index: false,
    fallthrough: true,
    dotfiles: "ignore",
    maxAge: "7d",
    etag: true,
    lastModified: true,
  })
);

/* Health */
app.get("/", (req, res) => res.send("✅ API is running..."));

/* Routes */
app.use("/api/users", userRoutes);
app.use("/api/otp", otpRoutes);

app.use("/api/blood-requests", bloodRequestRoutes);
app.use("/api/donation-confirmations", donationConfirmationRoutes);

app.use("/api/donation-request-confirmations", donationRequestConfirmationRoutes);
app.use("/api/donationRequests", donationRequestRoutes);

app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

/* Swagger dev-only */
if (!process.env.NODE_ENV || process.env.NODE_ENV !== "production") {
  require("./swagger")(app);
}

/* Errors */
app.use(notFound);
app.use(errorHandler);

/* Socket.IO */
setupSocket(io);

/* DB + Server */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB", err);
    process.exit(1);
  });
