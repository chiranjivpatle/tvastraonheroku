const mongoose = require('mongoose');

const url = "mongodb+srv://chiranjiv:chiranjivpatle@cluster0.y7jx4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
const connectDB = async () => {
    try{
        // mongodb connection string
        const con = await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        })
        console.log(`MongoDB connected : ${con.connection.host}`);
    }catch(err){
        console.log(err);
        process.exit(1);
    }
}

module.exports = connectDB ;