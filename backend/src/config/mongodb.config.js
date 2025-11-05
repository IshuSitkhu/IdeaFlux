require('dotenv').config();
const mongoose = require('mongoose');
const { MongoDbConfig } = require('./config');

const connectToMongoDB = async() => {
    try{
        await mongoose.connect(MongoDbConfig.url,{
            dbName: MongoDbConfig.dbname,
            autoCreate: true,
            autoIndex: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of hanging forever
            socketTimeoutMS: 10000, // Close sockets after 10 seconds of inactivity
        })
        console.log("**********MongoDB connected successfully**********");

    }catch(error) {
        console.error('**********Error connecting to MongoDB:**********');
        console.error(error);
        console.log('\n⚠️  Server will start anyway, but database features will not work.');
        console.log('💡 To fix: Check MongoDB Atlas Network Access settings\n');
    }
}

module.exports = connectToMongoDB;