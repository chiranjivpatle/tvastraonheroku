const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

var schema = new mongoose.Schema({
    name : {
        type : String,
        required: true
    },
    email : {
        type: String,
        required: true,
        index:true
    },
    password : {
        type : String,
        
        
    },
    gender : String,

    birthdate : {
        type : String
    },
    mobileNo : {
        type : Number,
        unique : true,
        required : true
    },

    city : String,
    state : String,

    country : String,
    doctor:String,
    timezon :{
        type: String
    },
    house_no :{
        type: String
    },
    colony :{
        type: String
    },
    file :{
        type: String
    },

    
    yourself :{
        type: String
    },
    
    achivement :{
        type: String
    },
    hospital :{
        type: String
    },
    experience :{
        type: String
    },
    qualification :{
        type: String
    },
    awards :{
        type: String
    },
    specification :{
        type: String
    },
    fees :{
        type: String
    },
    yourself :{
        type: String
    },
    type : {
        type : String
    },
    schedule :[],
    slots:[],
    appointments:[]
})

var medical_records = new mongoose.Schema({
    file : [],
    title : {
        type: String,
        required :true
    },
    name : {
        type : String,
        required :true
    },
    mobileNo : {
        type : String,
        required : true
    },
    record : {
        type : String,
        required : true
    }
})

//scheme for hospital_list table....
var hospital_lists = new mongoose.Schema({
         
    name :{
        type: String,
        required:true
    },
    discription :{
        type: String
    },
    speciality :{
        type: String
    },
    bed :{
        type: Number
    },
    address :{
        type: String
    },
    file :{
        type: String
    },
    treatment :{
        type: String
    }

});

/* for bcrypt of password */
/*schema.pre("save", async function(next){
    if(this.isModified("password")){
    //const passwordhash = await bcrypt.hash(password, 10);
    console.log(`the current password is ${this.password}`);
    this.password = await bcrypt.hash(this.password, 10);
    console.log(`the current password is ${this.password}`);
    }
    next();
})*/

const Userdb = mongoose.model('userdb', schema);
const medical_record = mongoose.model('medical_record', medical_records);
const hospital_list = mongoose.model('hospital_list',hospital_lists) ;


module.exports = {
    Userdb,
    medical_record,
    hospital_list
}