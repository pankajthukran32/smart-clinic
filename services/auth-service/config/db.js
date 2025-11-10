const mongoose = require('mongoose');
const colors = require('colors');

const dbConnect = async (uri) => {
    try {
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected!`.bgBlue)
    } catch (error) {
        console.error("Error During DB Connections: ", error);
    }
}


module.exports = dbConnect;