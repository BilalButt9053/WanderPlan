const mongoose =require('mongoose');

const URI=process.env.MONGODB_URI;

const connectDB = async () => {
    try {
    if (!URI) {
        throw new Error("MONGODB_URI is not defined");
    }

    console.log(`Attempting to connect with URI: ${URI?.substring(0, 50)}...`);
    await mongoose.connect(URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 20,
    });
    console.log(`MongoDB connected`);

    mongoose.connection.on("connected", () => {
        console.log("[mongodb] connected");
    });

    mongoose.connection.on("disconnected", () => {
        console.warn("[mongodb] disconnected");
    });

    mongoose.connection.on("reconnected", () => {
        console.log("[mongodb] reconnected");
    });

    mongoose.connection.on("error", (error) => {
        console.error("[mongodb] connection error", error);
    });
} catch(error){
    console.error("Error ❌",error);
    process.exit(1);
}
};
module.exports = connectDB;