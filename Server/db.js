const mongoose =require('mongoose');

const URI=process.env.MONGODB_URI;

const connectDB = async () => {
    try {
    console.log(`Attempting to connect with URI: ${URI?.substring(0, 50)}...`);
    const conn = await mongoose.connect(URI);
    console.log(`MongoDB connected`);
} catch(error){
    console.error("Error ❌",error);
    process.exit(1);
}
};
module.exports = connectDB;