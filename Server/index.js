require('dotenv').config();
const express = require("express");
const path = require("path");
const os = require("os");
const http = require("http");
const app = express();
const authRoute=require("./router/auth-router");
const ConnectDb =require("./db");
const errorMiddleware=require("./middleware/error-middleware");
const cors = require("cors");
const adminRoute = require("./router/admin-router");
const otpRoute = require("./router/otp-router");
const reviewsRoute = require("./router/reviews-router");
const uploadsRoute = require("./router/uploads-router");
const businessAuthRoute = require("./router/business-auth-router");
const adminBusinessRoute = require("./router/admin-business-router");
const businessUploadRoute = require("./router/business-upload-router");
const menuItemRoute = require("./router/menu-item-router");
const dealRoute = require("./router/deal-router");
const notificationRoute = require("./router/notification-router");
const publicRoute = require("./router/public-router");
const tripRoute = require("./router/trip-router");
const itineraryRoute = require("./router/itinerary-router");
const complaintRoute = require("./router/complaint-router");
const adminComplaintRoute = require("./router/admin-complaint-router");
const userProfileRoute = require("./router/user-profile-router");
const placesRoute = require("./router/places-router");
// New admin routes
const adminStatsRoute = require("./router/admin-stats-router");
const adminReviewRoute = require("./router/admin-review-router");
const adminRewardRoute = require("./router/admin-reward-router");
const adminNotificationRoute = require("./router/admin-notification-router");
// New business routes
const businessAnalyticsRoute = require("./router/business-analytics-router");
const businessReviewRoute = require("./router/business-review-router");
const mongoose = require("mongoose");


const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
    : ["*"];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("CORS origin not allowed"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning"],
    credentials: false,
}));
app.options("*", cors());


app.use(express.json());

// Basic request logger with response status for troubleshooting ngrok traffic.
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const elapsed = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${elapsed}ms)`);
    });
    next();
});

app.use((req, _res, next) => {
    if (req.path === "/api/auth/login") {
        console.log("[auth-login] Incoming login request", {
            ip: req.ip,
            hasBody: !!req.body,
            email: req.body?.email || null,
        });
    }
    next();
});

// Static hosting for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (_req, res) => {
    const mongoStateMap = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting",
    };

    return res.status(200).json({
        success: true,
        status: "ok",
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
        mongodb: mongoStateMap[mongoose.connection.readyState] || "unknown",
    });
});

app.use("/api/auth",authRoute);
app.use("/api/admin",adminRoute);
app.use("/api/otp",otpRoute);
app.use("/api/reviews", reviewsRoute);
app.use("/api/uploads", uploadsRoute);
app.use("/api/business", businessAuthRoute);
app.use("/api/admin", adminBusinessRoute);
app.use("/api/business/upload", businessUploadRoute);
app.use("/api/business/menu-items", menuItemRoute);
app.use("/api/business/deals", dealRoute);
app.use("/api/business/notifications", notificationRoute);
app.use("/api/public", publicRoute);
app.use("/api/trips", tripRoute);
app.use("/api/itineraries", itineraryRoute);
app.use("/api/complaints", complaintRoute);
app.use("/api/admin/complaints", adminComplaintRoute);
app.use("/api/user", userProfileRoute);
app.use("/api/places", placesRoute);
// New admin routes
app.use("/api/admin/stats", adminStatsRoute);
app.use("/api/admin/reviews", adminReviewRoute);
app.use("/api/admin/rewards", adminRewardRoute);
app.use("/api/admin/notifications", adminNotificationRoute);
// New business routes
app.use("/api/business/analytics", businessAnalyticsRoute);
app.use("/api/business/reviews", businessReviewRoute);

app.use((req, _res, next) => {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    error.status = 404;
    next(error);
});

app.use((err, _req, _res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        const jsonError = new Error("Invalid JSON payload");
        jsonError.status = 400;
        jsonError.extraDetail = err.message;
        return next(jsonError);
    }
    return next(err);
});

app.use(errorMiddleware);

const port = process.env.PORT || 5000;

function getLocalIp() {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}

ConnectDb().then(() => {
    // Bind to 0.0.0.0 so the server is reachable from other devices on the LAN
    const listenHost = '0.0.0.0';
    const localIp = getLocalIp();
    const server = http.createServer(app);

    server.listen(port, listenHost, () => {
        console.log(`\n=== WanderPlan Server ===`);
        console.log(`Local:    http://localhost:${port}/api`);
        console.log(`Network:  http://${localIp}:${port}/api`);
        if (process.env.NGROK_URL) {
            console.log(`Ngrok:    ${process.env.NGROK_URL}/api`);
        } else {
            console.log(`Ngrok:    Not configured (add NGROK_URL to .env)`);
        }
        console.log(`==========================\n`);
    });

    server.on("error", (err) => {
        console.error("[server] Fatal server error", err);
    });

    const shutdown = (signal) => {
        console.log(`[server] Received ${signal}. Shutting down gracefully...`);
        server.close(() => {
            console.log("[server] HTTP server closed.");
            mongoose.connection.close(false).finally(() => process.exit(0));
        });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("uncaughtException", (err) => {
        console.error("[server] Uncaught exception", err);
    });
    process.on("unhandledRejection", (reason) => {
        console.error("[server] Unhandled rejection", reason);
    });
}).catch((err) => {
    console.error("[server] Failed to start due to DB connection error", err);
    process.exit(1);
});