const axios = require('axios');

var models = require('../model/model');



const OtpManager = require("../../otpfiles/OtpManager");
const otpRepository = require("../../otpfiles/otpRepository");
const otpSender = require("../../otpfiles/otpSender");

const otpManager = new OtpManager(otpRepository, { otpLength: 4, validityTime: 5 });
var ObjectID = require('mongodb').ObjectID;

//app.use(morgan("dev"));

/*app.post("/otp", (req, res) => {
    const otp = otpManager.create(req.params.token);
    otpSender.send(otp, req.body);
    res.sendStatus(201);
});
*/

/*app.get("/otp/:token/:code", (req, res) => {
    const verificationResults = otpManager.VerificationResults;
    const verificationResult = otpManager.verify(req.params.token, req.params.code);
    let statusCode;
    let bodyMessage;

    switch (verificationResult) {
        case verificationResults.valid:
            statusCode = 200;
            bodyMessage = "OK";
            break;
        case verificationResults.notValid:
            statusCode = 404;
            bodyMessage = "Not found"
            break;
        case verificationResults.checked:
            statusCode = 409;
            bodyMessage = "The code has already been verified";
            break;
        case verificationResults.expired:
            statusCode = 410;
            bodyMessage = "The code is expired";
            break;
        default:
            statusCode = 404;
            bodyMessage = "The code is invalid for unknown reason";
    }
    res.status(statusCode).send(bodyMessage);
});
*/


const checkMainLogin = (req, res) => {
    if (req.session.userid) {
        res.redirect("/home");
    }else {
         res.redirect("/emaillogin")
    }
}

const checkpreLogin = (req, res, next) => {
    if (req.session.userid) {
        res.redirect("/home");
    }
   
    else {
        next();
    }
}

const emaillogin =  (req, res) => {

    if (req.body.email && req.body.password) {
        models.Userdb.findOne({ email: req.body.email })
        .then(user => {
            console.log(user)
                if (user.password == req.body.password) {
                    req.session.userid = { user: user, count: 0 };
                    req.session.message = { success: { head: "Success", body: "You have successfully logged in." } };
                   //req.session.message = { success:  "You have successfully logged in."};
                    console.log("......req.session.userid", req.session.userid)
                    console.log("......req.session.message.success", req.session.message.success)
                    if( user.type == "admin" ){
                        res.redirect("/admin");
                   }else{
                       res.redirect("/home");
                   }
                } else {
                    req.session.error_message = "Wrong Password"
                    res.redirect("/emaillogin");
                }
        })
        .catch(err => {
            console.log("enter valid Username")
            req.session.error_message = "enter valid Username"
            res.redirect("/emaillogin");
        })
    }else {
        req.session.error_message = "Enter all values";
        res.redirect("/emaillogin");
    }
}

const checkLogin = (req, res, next) => {
   
    if (req.session.userid) {
        console.log("check");
        next();
    } else {
        req.session.error_message = "Login To Access";
        return res.redirect("/emaillogin")
    }
}


const forgot_password = (req, res)=>{
    models.Userdb.findOne({"email":req.body.email})
    .then(user => {
        console.log(user.email);  
        console.log(user.mobileNo);  
        req.session.number  = user.mobileNo;

       axios.post(`http://localhost:3000/otp/${req.session.number}`)
       .then(function(response){
          console.log(response.data)
          req.session.otp_err = "valid for 60seconds";
           res.redirect('../otp');
       })
       .catch(err =>{
           res.send(err);
       })
    })
    .catch(err => {
        req.session.error_message = "enter valid Username";
        res.redirect("/emaillogin")
    })
}

const phonelogin = (req,res) => {
    models.Userdb.findOne({"mobileNo":req.body.mobileNo})
    .then(user => {
          
        console.log(user.mobileNo);  
        req.session.number  = user.mobileNo;
        
        

       axios.post(`http://localhost:3000/otp/${req.session.number}`)
       .then(function(response){
        console.log(".....................then is running");
         req.session.phone_login = true;

          //console.log(".........response", response);
          console.log(".........response.data", response.data);
          req.session.otp_err = "valid for 60s";
           res.redirect('../otp');
       })
       .catch(err =>{
        console.log(".....................catch is running");
           res.send(err);
       })
    })
    .catch(err => {
        req.session.otp_err = "Mobile no is not matching";
        res.redirect("/phonelogin")
    })
}

const otp_create = (req,res) => {
    const otp = otpManager.create(req.params.token);
    otpSender.send(otp, req.body);
     res.sendStatus(201);
}

const otp_send =(req, res)=> {
    //console.log(".....req.body", req.body);
    //console.log(".....!req.body", !req.body);

    if(req.body.input1 == '' && req.body.input2 == '' && req.body.input3 == '' && req.body.input4 == '') {
        req.session.otp_error = "enter otp first";
        res.redirect('../otp');
    }

    var otp_number = req.body.input1 + req.body.input2 + req.body.input3 + req.body.input4 ;
    var mobile_number = req.session.number ;

    console.log("mobile_number = ",`${mobile_number}`)
    console.log("otp_number = ",`${otp_number}`)


    axios.get(`http://localhost:3000/otp/${mobile_number}/${otp_number}`)

    .then(response =>{
        console.log("otp get working = ",response.data)
        console.log(".......................................req.session.phone_login", req.session.phone_login);
        console.log("......................................then working");

         if(req.session.phone_login){

            req.session.userid = {user : response.data, count : 0};
            req.session.message = { success: { head: "Success", body: "You have successfully logged in." } };
            res.redirect('/home');
         }
         else {
        res.redirect('/create_password');
        }
    })
    .catch(err => {
        console.log("......................................catch working");
        console.log("err.response.status:", err.response.status)

        if( 404 == err.response.status ){
            req.session.otp_err = "enter correct otp"
            res.redirect('/otp');
        }
        if( 409 == err.response.status ){
            req.session.otp_err = "The code has already been verified";
            res.redirect('/otp');
        }
        if( 410 == err.response.status ){
            req.session.otp_err = "The code is expired";
            res.redirect('/otp');
        }
        res.status(500).send({ message : err.message || "Error Occurred while retriving user information" })
    })
}

const otp_verifi = (req, res) => {
    const verificationResults = otpManager.VerificationResults;
    const verificationResult = otpManager.verify(req.params.token, req.params.code);
    let statusCode;
    let bodyMessage;

    switch (verificationResult) {
        case verificationResults.valid:
            statusCode = 200;
            bodyMessage = "OK";
            break;
        case verificationResults.notValid:
            statusCode = 404;
            bodyMessage = "Not found";
            break;
        case verificationResults.checked:
            statusCode = 409;
            bodyMessage = "The code has already been verified";
            break;
        case verificationResults.expired:
            statusCode = 410;
            bodyMessage = "The code is expired";
            break;
        default:
            statusCode = 404;
            bodyMessage = "The code is invalid for unknown reason";
    }
    res.status(statusCode).send(bodyMessage);
}

const create_password = (req,res)=>{
    var password = req.body.password ;
    var confirm_password = req.body.confirm_password ;
    console.log("password = ",password)
    console.log("confirm_password = ",confirm_password)

    if(  req.body.password == req.body.confirm_password ){
        var number = req.session.number ;
            delete req.session.number ;
            Userdb.updateOne( {'number' : number}, {$set:{"password" : password }}  )
                .then(user => {
                    console.log("update succsesful")
                    req.session.succ_message = "You have successfully logged in." ;
                    res.redirect("/emaillogin");
                    
                })
                .catch(err => {
                    res.status(500).send({ message : err.message || "Error Occurred while retriving user information for update" });
                    
                })
    }else{
        req.session.password_error = "confirm_password is wrong" ;
        res.redirect("/create_password")
    }
}


const signup = (req,res)=>{
    // validate request
  
   
    
        const user = new models.Userdb({
        name : req.body.name,
        email : req.body.email,
        password : req.body.password,
        gender : req.body.gender,
        birthdate : req.body.birthdate,
        mobileNo : req.body.mobileNo,
        city : req.body.city,
        state : req.body.state,
        country : req.body.country,
        doctor : req.body.doctor,
        type : "user"
        
    })
    // save user in the database
    user
        .save(user)
        .then(data => {
            
            res.redirect('/emaillogin')
        })
        .catch(err =>{
            // console.log("seconddddddddddd");
            // res.status(500).send({
               
            //     message : err.message || "Some error occurred while creating a create operation"
               
                req.session.error_message = "please enter all details";
                res.redirect('/signup');
            
            
        });
    
     
     //else{
    //     // create new user
    //     console.log("req.body.name = ",req.body.name)
    //     console.log("req.body.email = ",req.body.email)
    //     console.log("req.body.password = ",req.body.password)
    //     console.log("req.body.gender = ",req.body.gender)
    //     //console.log("req.body.data = ",req.body.data)
    //     //console.log("req.body.number = ",req.body.number)
    //     console.log("req.body.city = ",req.body.city)
    //     console.log("req.body.state = ",req.body.state)
    //     console.log("req.body.country = ",req.body.country)
    //     console.log("req.body.doctor = ",req.body.doctor)
    //     console.log("req.body.achivement = ",req.body.achivement)
    //     console.log("req.body.hospital = ",req.body.hospital)

    //     var tag_inputs = []
    //     var inputs_arr = [req.body.achivement , req.body.hospital , req.body.qualification , req.body.awards , req.body.specification] ;
        
    
    //     for(var j = 0 ; j < inputs_arr.length ;j++){
    //         console.log("inputs_arr[j] = ",inputs_arr[j]);
    //         var input = JSON.parse(inputs_arr[j]) ;
    //         console.log("22222inputs_arr[j] = ",input);
    //         console.log("22222inputs_arr[j] = ",input[j]);
    //         console.log(`..............................................${input} = `,  input )
    //         var arr = [];
    //         for(var i = 0 ; i < input.length ;i++){
    //             arr.push(`${input[i].value}`);
    //         }
    //         console.log(arr);
    //         var arr_str = arr.toString()
    //         console.log(arr_str);
    //         tag_inputs.push(arr_str)
    //     }
    //     req.session.tag_value = tag_inputs ;
    //     console.log("................................................req.session.tag_value.........",req.session.tag_value) 

    //     console.log("req.body.yourself = ",req.body.yourself)
    //     console.log("req.file = ",req.file)
    //     console.log("req.body.achivement = ",tag_inputs[0])
    //     console.log("req.body.hospital = ",tag_inputs[1])
    //     console.log("req.body.experience = ",req.body.experience)
    //     console.log("req.body.qualification = ",tag_inputs[2])
    //     console.log("req.body.awards = ",tag_inputs[3])
    //     console.log("req.body.specification = ",tag_inputs[4])
    //     console.log("req.body.fees = ",req.body.fees) 
    //     console.log("req.body.yourself = ",req.body.yourself)

    //     const user = new models.Userdb({
    //         name : req.body.name,
    //         email : req.body.email,
    //         password : req.body.password,
    //         gender : req.body.gender,
    //         birthdate : req.body.birthdate,
    //         mobileNo : req.body.mobileNo,
    //         city : req.body.city,
    //         state : req.body.state,
    //         country : req.body.country,
    //         doctor : req.body.doctor,
            
    //         file : req.file.filename,
    //         achivement : tag_inputs[0],
    //         hospital : tag_inputs[1],
    //         experience : req.body.experience,
    //         qualification : tag_inputs[2],
    //         awards : tag_inputs[3],
    //         specification :tag_inputs[4],
    //         fees : req.body.fees,
    //         yourself : req.body.yourself,
    //         type : "doctor"
                                    
    //     })
    //     // save user in the database
    //     user
    //         .save(user)
    //         .then(data => {
    //         res.redirect('emaillogin')
    //         })
    //         .catch(err =>{
    //             // res.status(500).send({
    //             //     message : err.message || "Some error occurred while creating a create operation"
    //             // });
    //             req.session.error_message = "please enter all details";
    //             res.redirect('/signup');
    //         });
        
    // }
    
    
}

const signupdoc =(req,res)=> {
   
  var objectofall =
      {
      name  :  req.body.name,
      email: req.body.email,
      password:  req.body.password,
      birthdate:  req.body.birthdate,
      mobileNo: req.body.mobileNo,
      gender:  req.body.gender,
      city :req.body.city,
      state: req.body.state,
      country:  req.body.country,
      doctor : "doctor"
    }
    req.session.objectofall = objectofall ;
    res.render("signup", data = { user: false , doclog : true })
    
}
const signupdocnew =(req,res)=>{
    
        // create new user
        console.log("req.body.name = ",req.session.objectofall.name)
        console.log("req.body.email = ",req.session.objectofall.email)
        console.log("req.body.password = ",req.session.objectofall.password)
        console.log("req.body.gender = ",req.session.objectofall.gender)
        //console.log("req.body.data = ",req.body.data)
        //console.log("req.body.number = ",req.body.number)
        
        console.log("req.body.city = ",req.session.objectofall.city)
        console.log("req.body.state = ",req.session.objectofall.state)
        console.log("req.body.country = ",req.session.objectofall.country)
        console.log("req.body.doctor = ",req.session.objectofall.doctor)
        console.log("req.body.filename = ",req.file.filename)
        console.log("req.body.achivement = ",req.body.achivement)
        console.log("req.body.hospital = ",req.body.hospital)

        var tag_inputs = []
        var inputs_arr = [req.body.achivement , req.body.hospital , req.body.qualification , req.body.awards , req.body.specification] ;
        
    
        for(var j = 0 ; j < inputs_arr.length ;j++){
            console.log("inputs_arr[j] = ",inputs_arr[j]);
            var input = JSON.parse(inputs_arr[j]) ;
            console.log("22222inputs_arr[j] = ",input);
            console.log("22222inputs_arr[j] = ",input[j]);
            console.log(`..............................................${input} = `,  input )
            var arr = [];
            for(var i = 0 ; i < input.length ;i++){
                arr.push(`${input[i].value}`);
            }
            console.log(arr);
            var arr_str = arr.toString()
            console.log(arr_str);
            tag_inputs.push(arr_str)
        }
        req.session.tag_value = tag_inputs ;
        console.log("................................................req.session.tag_value.........",req.session.tag_value) 

        console.log("req.body.yourself = ",req.body.yourself)
        console.log("req.file = ",req.file)
        console.log("req.body.achivement = ",tag_inputs[0])
        console.log("req.body.hospital = ",tag_inputs[1])
        console.log("req.body.experience = ",req.body.experience)
        console.log("req.body.qualification = ",tag_inputs[2])
        console.log("req.body.awards = ",tag_inputs[3])
        console.log("req.body.specification = ",tag_inputs[4])
        console.log("req.body.fees = ",req.body.fees) 
        console.log("req.body.yourself = ",req.body.yourself)

        const user = new models.Userdb({
            name : req.session.objectofall.name,
            email : req.session.objectofall.email,
            password : req.session.objectofall.password,
            gender : req.session.objectofall.gender,
            birthdate : req.session.objectofall.birthdate,
            mobileNo : req.session.objectofall.mobileNo,
            city : req.session.objectofall.city,
            state : req.session.objectofall.state,
            country : req.session.objectofall.country,
            doctor : req.session.objectofall.doctor,
            
            file : req.file.filename,
            achivement : tag_inputs[0],
            hospital : tag_inputs[1],
            experience : req.body.experience,
            qualification : tag_inputs[2],
            awards : tag_inputs[3],
            specification :tag_inputs[4],
            fees : req.body.fees,
            yourself : req.body.yourself,
            type : "doctor"
                                    
        })
        // save user in the database
        user
            .save(user)
            .then(data => {
                console.log("chalra kyaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")

                console.log("chalra kyaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
                  models.hospital_list.find()
                .then(users =>{
                    var ok = true ;
                    var index = [];
                    var typehospital= tag_inputs[1].split(",");
                    for(var j=0; j< typehospital.length ;j++) {
                        for(var k=0; k < users.length ;k++){

                            var hospitals= users[k].name.split(",");
                            for(var l=0; l< hospitals.length ;l++) {
                                console.log(`....${hospitals[l].toLowerCase()} == ${typehospital[j].toLowerCase()}...... ,l `,hospitals[l].toLowerCase() == typehospital[j].toLowerCase())
                                
                                if(hospitals[l].toLowerCase() == typehospital[j].toLowerCase()){
                                    ok = false ;
                                    console.log("hospital exist")
                                    index.push(j);
                                }
                            }

                        }
                    }

                    console.log(" .....index",index) ;
                    let newindex = [...new Set(index)];
                    console.log("uniqueChars =",newindex);

                    for(var l=0; l< typehospital.length ;l++) {
                            if( newindex.indexOf(l) != -1 ){
                                console.log(" ................................dont create hospital ,j ",j)
                            }else{
                                console.log(" ................................create hospital ,l ",l)
                                
                                const hospital = new models.hospital_list({
                                    name : typehospital[l]
                                })
                                hospital
                                    .save(hospital)
                                    .then(data => {
                                        // res.redirect('emaillogin')
                                        console.log(" ................................create hospital in database,l ",l) ;
                                    })
                                    .catch(err =>{
                                        res.status(500).send({
                                            message : err.message || "Some error occurred while creating a create operation"
                                        });
                                    });
                            }
                    }
                    res.redirect('emaillogin')
                    

                })
                .catch(err =>{
                    res.status(500).send({
                        message : err.message || "Some error occurred while creating a create operation"
                    });
                })
                
            // res.redirect('emaillogin')
            })
            .catch(err =>{
                console.log("chalra nahiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")

                 res.status(500).send({
                     message : err.message || "Some error occurred while creating a create operation"
                 });
                // req.session.error_message = "please enter all details";
                // res.redirect('/signup');
            });
        
    }

const logout = (req, res) => {
    if (req.session.userid) {
        delete req.session.userid;
        delete req.session.update_data;
    }
    res.redirect("/emaillogin")
}



const profile = (req,res,next)=>{

    if(req.session.update_data){
      var  y = req.session.update_data.mobileNo
    }else{
      var  y = req.session.userid.user.mobileNo ;
      console.log("..............................................req.session.userid.userr",req.session.userid.user)

    }

  models.Userdb.find({ mobileNo: y })
  .then(user => {
        console.log("..............................................records of login_user",user)
        //req.session.record = user;
        next();
  })
  .catch(err => {
       res.redirect("/emaillogin");
  })
}


const update_profile = (req,res) => {
    if(req.session.userid.user.type == "admin"){
        if(data.user){
            var id = data.user._id ;
        }else{
            var id = req.session.userid.user._id ;
            req.session.adminprofileupdate = true ;
        }
    }else{
        var id = req.session.userid.user._id ;
    }

    
    console.log("req.session.userid.user.file = ",req.session.userid.user.file)
    console.log("req.file = ",req.file)

    if(!req.file){
        if(req.session.update_data){
            x = req.session.update_data.file
        }else{
            if(req.session.userid.user.type == "admin"){
                if(data.user){
                    var x = data.user.file ;
                }else{
                    var x = data.admin.file ;
                }
            }else{
                var x = req.session.userid.user.file ;
            }
        }
    }
    else{
        var x = req.file.filename ;
    }

    // if(data.user.type == "user"){
    //     var doctor = "user" ;
    // }else{
    // }
    var doctor = req.session.userid.user.doctor ;
    console.log("...................................update_profile.........doctor = ",doctor)


    if(id){
        if(!(doctor == "doctor")){
            models.Userdb.updateOne( {'_id' : id}, 
            {$set:{
                "name" : req.body.name ,
                "mobileNo" : req.body.mobileNo ,
                "email" : req.body.email ,
                "gender" : req.body.gender ,
                "birthdate" : req.body.birthdate ,
                "timezon" : req.body.timezon ,
                "house_no" : req.body.house_no ,
                "colony" : req.body.colony ,
                "city" : req.body.city ,
                "state" : req.body.state ,
                "country" : req.body.country,
                "file":  x
            }}  )
                .then(user => {
                    console.log("profile updata succsesful")
                    req.session.update_profile = "profile update successfuly" ;
    
                    models.Userdb.findOne({ '_id' : id})
                    .then(user=>{
                        req.session.update_data = user;
                        console.log(".......................................req.session.update_data",req.session.update_data)
                           if(req.session.userid.user.type == "admin"){
                               if(data.user){
                                   if(data.user.type == "doctor"){
                                        res.redirect("/doctoradmin");
                                   }else{
                                       res.redirect("/useradmin");
                                   }
                                }else{
                                    req.session.admin_update_data = user;
                                    res.redirect("/profile");
                                    // res.redirect("/admin");  2 min me aaya
                                }
                            }else{
                                res.redirect("/profile");
                            }
                    })
                    .catch(err=>{
                        res.redirect("/home");
                    })
                })
                .catch(err => {
                    res.status(500).send({ message : err.message || "Error Occurred while retriving user information for update" })
                })
        }else{


            var tag_inputs = []
            var inputs_arr = [req.body.achivement , req.body.hospital , req.body.qualification , req.body.awards , req.body.specification] ;
        
            for(var j = 0 ; j < inputs_arr.length ;j++){
                var input = JSON.parse(inputs_arr[j]) ;
                console.log(`..............................................${input} = `,  input )
                var arr = [];
                for(var i = 0 ; i < input.length ;i++){
                    arr.push(`${input[i].value}`);
                }
                console.log(arr);
                var arr_str = arr.toString()
                console.log(arr_str);
                tag_inputs.push(arr_str)
            }
            req.session.tag_value = tag_inputs ;
            console.log("................................................req.session.tag_value.........",req.session.tag_value) 
    

            models.Userdb.updateOne( {'_id' : id}, 
            {$set:{
                "name" : req.body.name ,
                "mobileNo" : req.body.mobileNo ,
                "email" : req.body.email ,
                "gender" : req.body.gender ,
                "birthdate" : req.body.birthdate ,
                "timezon" : req.body.timezon ,
                "house_no" : req.body.house_no ,
                "colony" : req.body.colony ,
                "city" : req.body.city ,
                "state" : req.body.state ,
                "country" : req.body.country,
                "file":  x,
                
                achivement : tag_inputs[0],
                hospital : tag_inputs[1],
                experience : req.body.experience,
                qualification : tag_inputs[2],
                awards : tag_inputs[3],
                specification :tag_inputs[4],
                fees : req.body.fees,
                yourself : req.body.yourself 
            }}  )
                .then(user => {
                    console.log("profile updata succsesful")
                    req.session.update_profile = "profile update successfuly" ;
    
                    models.Userdb.findOne({ '_id' : id})
                    .then(user=>{
                        req.session.update_data = user;
                        console.log(".......................................req.session.update_data",req.session.update_data)
                        res.redirect("/profile");
                    })
                    .catch(err=>{
                        res.redirect("/home");
                    })
                })
                .catch(err => {
                    res.status(500).send({ message : err.message || "Error Occurred while retriving user information for update" })
                })
        }

    }else{
        console.log("profile is not updated");
        req.session.error_message = "profile is not updated" ;
        res.redirect("/profile")
    }
}

const medical_record = (req,res) => {
      
    console.log ( 'title',  req.body.title,
        'name',  req.body.name,
        'date',  req.body.date,
        'mobileNo', req.body.mobileNo,
        'record',  req.body.record_type,
        )
    console.log("rrq.files...........", req.files);

    const medical_records = new models.medical_record({
            file : req.files,
            title : req.body.title,
            name : req.body.name,
            date : req.body.date,
            mobileNo :req.body.mobileNo,
            record : req.body.record_type
       
        
    })
    // save user in the database
    medical_records
        .save(medical_records)
        .then(data => {
            console.log(".........",data);
            res.redirect('/medical_report')
        })
        .catch(err =>{
            console.log("catch is running..............");
                res.status(500).send({
                message : err.message || "Some error occurred while creating a create operation"})
                //req.session.error_message = "please enter all details";
                //res.redirect('/medical_record');
            
        });
    
}

const show_record = (req,res, next)=>{
    if(req.body.record_id){
        console.log("..................................................req.body.file =",req.body.record_id)
        req.session.recordid = req.body.record_id ;
    }
    models.medical_record.findOne({_id : req.session.recordid})
    .then(responce =>{
        console.log(".................................................responce=",responce)
        req.session.record_responce = responce ;
        next();
    })
    .catch(err =>{
         
    })

} 

const delete_record = (req,res)=>{
    var uid = req.body.uid;
    console.log("........................................uid",uid);
    models.medical_record.remove({ "_id": uid })
    .then(user => {
          console.log("..............................................user",user)
          res.redirect("/medical_report");
    })
    .catch(err => {
        console.log("..............................................err",err)
         res.redirect("/emaillogin");
    })

}


const medical_report = (req,res,next) => {
   
    
     if(req.session.update_data){

                    if(req.session.userid.user.type == "admin"){
                        var  y = req.query.mobileNo ;
                        if(req.query.mobileNo == undefined ){
                            y = req.session.y ;
                        }else{
                            req.session.y = y ;
                        }
                        console.log("............................................. req.query.number,y",  req.query.number,y)
                    }else{
                        var  y = req.session.update_data.mobileNo
                    }

                }else{
                    if(req.session.userid.user.type == "admin"){
                        var  y = req.query.mobileNo ;
                        if(req.query.mobileNo == undefined ){
                            y = req.session.y ;
                        }else{
                            req.session.y = y ;
                        }
                        console.log("i l mc = ",req.query.i)
                        console.log("............................................. req.query.number,",  req.query.mobileNo)
                    }else{
                        var  y = req.session.userid.user.mobileNo ;
                    }
                //  console.log("..............................................req.session.userid.userr",req.session.userid.user)
                } 
    
    models.medical_record.find({  mobileNo: y })
    .then(response =>{
        console.log(".................................................response of medical record=",response)
        req.session.record = response ;
        next();
    })
    .catch(err =>{
        console.log(".................................................catchhhhhhhh")
         next();
    })
}


const add_record_photo = (req,res)=>{
  
    console.log("..........................................add_record_photo..req.files......................."
    ,req.files)

    // for(var i=0 ; i < req.files.length ; i++ ){
    // }
        models.medical_record.updateOne( { _id :  req.session.recordid } , { $push: { "file": req.files } } )
        
        .then(user => {
            console.log("then working......")
            res.redirect("/show_record");
        })
        .catch(err => {
            console.log("..............................................err",err)
            res.redirect("/emaillogin");
        })


}

const delete_record_photo = (req,res)=>{

    var filename = req.body.delete_record_photo ;
    var a = req.session.recordid ; 

    console.log("..........................................delete_record_photo.",filename)
    console.log("..........................................a",a)

    models.medical_record.updateOne({"_id":a},{$pull:{"file":{"filename":filename}}},{multi:true} )
    .then(user => {
        req.session.photo_delete = true;
        res.redirect("/show_record");
    })
    .catch(err => {
        console.log("..............................................err",err)
        res.redirect("/emaillogin");
    })
}

const schedule_form = (req,res)=>{

    // check schedule is valid or not ........................
    models.Userdb
    .find({ _id :  data.user._id })
    .select({schedule : 1 }) 
    
    .then(user=>{

        // console.log("....................................list of obj with filter user=",user)
        // console.log(".................................... user[0].schedule[0]=",  user[0].schedule[0])
        // console.log(".................................... user[0].schedule[0].day=",  user[0].schedule[0].day)

        function miner (n){
            var startingtime = n ;
            var sts = startingtime.slice(0,2);
            var stss = parseInt(sts);
            var aps= startingtime.slice(6,8)
            if(aps=="PM" && stss != 12){ 
                stss = stss + 12;  
            }
             console.log("stss=",stss)
            var smin = startingtime.slice(3,5);
            var smin = parseInt(smin);
            var hsmin = stss*60 ;
            var tsmin = hsmin  + smin ;
             console.log("hsmin=",hsmin  )
             console.log("smin=",smin  )
             console.log("tsmin=",tsmin  )
            return tsmin ;
        }
        var comp = false;
        for(var i = 0 ; i < user[0].schedule.length ; i++){  
            if( user[0].schedule[i].day == req.body.day){
                console.log(" req.body.starttime - req.body.totime ",  req.body.starttime + " - " + req.body.totime)
                console.log( `  user[0].schedule[${i}].starttime - user[0].schedule[${i}].totime == `, user[0].schedule[i].starttime + " - " + user[0].schedule[i].totime )

                    console.log("miner(req.body.starttime) =",miner(req.body.starttime)  )
                    console.log("miner(req.body.totime) =",miner(req.body.totime)  )
                    console.log("miner(user[0].schedule[i].starttime) =",miner(user[0].schedule[i].starttime)  )
                    console.log("miner(user[0].schedule[i].totime) =",miner(user[0].schedule[i].totime)  )
                    
                    if( 
                        ( (miner(req.body.starttime) >= miner(user[0].schedule[i].totime)) && (miner(req.body.totime) >= miner(user[0].schedule[i].totime)) )        || 
                        ( (miner(req.body.starttime) <= miner(user[0].schedule[i].starttime)) &&  (miner(req.body.totime) <= miner(user[0].schedule[i].starttime))) 
                      ) {
                        console.log(" ok ")
                    }else{
                            console.log("not ok ")
                            comp = true ;
                    }
            }
        }
       
            if(!comp){
                
                            var schedule_index = req.body.schedule_index ;
                            console.log("req.body.schedule_index = ",req.body.schedule_index)
                        
                            console.log("req.body.day = ",req.body.day)
                            console.log("req.body.hospital = ",req.body.hospital)
                            console.log("req.body.starttime = ",req.body.starttime)
                            console.log("req.body.totime = ",req.body.totime)
                            console.log("req.body.interval = ",req.body.interval)
                        
                            var startingtime = req.body.starttime ;
                            var totime = req.body.totime ;
                            var interval= parseInt(req.body.interval);
                            console.log("starting time=", startingtime);
                            console.log("totime=", totime);
                            console.log("interval=", interval);
                        
                            var tsmin = miner(startingtime); ;
                            var temin = miner(totime);
                
                            var noslots = ( temin - tsmin )  / interval ;
                            console.log(`noslots = ( ${temin} - ${tsmin} ) / ${interval} =`,( temin - tsmin) / interval)
                            noslots = parseInt( noslots.toFixed(0) )
                        
                            console.log("noslots=",noslots)
                            
                            var slots = [];
                            for (i=0; i < noslots; i++)
                            {
                                var hour = startingtime.slice(0,2);
                                // console.log("hour=", hour)
                                var min = startingtime.slice(3,5);
                                var ampm= startingtime.slice(6,8);
                                var hours = parseInt(hour);
                            
                                // console.log("hours=",hours)
                                if(ampm=="PM" && hours != 12)
                                {
                                    hours = hours + 12;
                                }
                                var mins = parseInt(min);
                                var sum = interval + mins;
                            
                                if(interval==60){
                                    hours = hours + 1;
                                    sum = sum - 60;
                                }else if((sum/60) >= 1) {
                                    hours = hours + 1 ;
                                    sum = sum - 60;
                                }
                                else if (sum==60) {
                                    hours = hours + 1;
                                    sum = sum - 60;
                                }
                                var result ;
                                if(hours >= 12) {
                                    hours = hours - 12 ;
                                    if(sum < 10){
                                        result = "0" + `${hours}` + ":" + `0${sum}` + " " + "PM";
                                    }else{
                                        result = "0" + `${hours}` + ":" + `${sum}` + " " + "PM";
                                    }
                                }else {
                                    if(hours == 10 || hours == 11){
                                        if(sum < 10){
                                            result = `${hours}` + ":" + `0${sum}` + " " + "AM";
                                        }else{
                                            result = `${hours}` + ":" + `${sum}` + " " + "AM";
                                        }
                                    }else{
                                        if(sum < 10){
                                            result ="0" + `${hours}` + ":" + `0${sum}` + " " + "AM";
                                        }else{
                                            result ="0" + `${hours}` + ":" + `${sum}` + " " + "AM";
                                        }
                                    }
                                }
                              //  console.log("result=", result);
                                if(i == (noslots - 1)){
                                    if(startingtime.slice(0,2) == "00"){
                                        var replace3 = startingtime.replace("00","12");
                                        slots.push(`${replace3} - ${totime} `)
                                    }else{
                                        slots.push(`${startingtime} - ${totime} `)
                                    }
                                }else{
                                    if(startingtime.slice(0,2) == "00"){
                                        var replace = startingtime.replace("00","12");
                                        if(result.slice(0,2) == "00"){
                                            var replace1 = result.replace("00","12");
                                            slots.push(`${replace} - ${replace1}`)
                                        }else{
                                            slots.push(`${replace} - ${result}`)
                                        }
                                    }else if(result.slice(0,2) == "00"){
                                        var replace2 = result.replace("00","12");
                                        slots.push(`${startingtime} - ${replace2}`)
                                    }else{
                                        slots.push(`${startingtime} - ${result}`)
                                    }
                                }
                                startingtime = result;
                              //  console.log("new starting time=", startingtime)
                            
                            }
                            
                            var emtarr = [];
                            for(var k = 0 ; k < slots.length ; k++ ){
                                emtarr.push({
                                    id:k,
                                    schedule_time:slots[k],
                                    checkbox:"false",
                                    isbook:"false"
                                })
                            }
                            
                            // console.log("slots = ",slots);
                            // console.log("emtarr =",emtarr);
                        
                            var obj = {
                                schedule_index:schedule_index,
                                schedule_checkbox : "false",
                                day : req.body.day,
                                hospital : req.body.hospital,
                                starttime : req.body.starttime,
                                totime : req.body.totime,
                                interval :req.body.interval ,
                                slots:emtarr
                            }
                        
                            console.log("data.user.number = ",data.user.number)
                            models.Userdb.updateOne( { _id : data.user._id} , { $push: { "schedule": obj } } )
                            .then(response => {
                                models.Userdb.findOne({ _id :  data.user._id})
                                .then(user=>{
                                    req.session.update_data = user;
                                    req.session.schedule_creared = "schedule creared seccesfully"
                                   // console.log(".......................................req.session.update_data",req.session.update_data)
                                    res.redirect("/schedule");
                                })
                                .catch(err=>{
                                    res.redirect("/home");
                                })
                            })
                            .catch(err => {
                                console.log("..............................................err",err)
                                res.redirect("/emaillogin");
                            }) 
            }else{
                req.session.schedule_creared = "time is booked"
                res.redirect("/schedule");
            }

    })
    .catch(err=>{
        res.redirect("/home");
    })


    // end schedule is valid or not ........................

}

const delete_schedule = (req,res)=>{

    console.log("req.query.id",req.query.id)
    var xy = req.query.id ;  
//   var xy =  req.body.delete_schedule  ;
  console.log("..............................................xy",xy)
  console.log("..............................................typeof(xy)",  typeof(xy) )

    models.Userdb.updateOne(
    { _id : data.user._id},
    {$pull : {"schedule" : {schedule_index : xy}}}
    ) 
    .then(user => {
        models.Userdb.findOne({ _id :  data.user._id})
            .then(user=>{
                req.session.update_data = user;
                console.log(".......................................req.session.update_data",req.session.update_data)
                res.redirect("/schedule");
            })
            .catch(err=>{
                res.redirect("/home");
            })
    })
    .catch(err => {
        console.log("..............................................err",err)
        res.redirect("/emaillogin");
    })
}

const schedule_checkbox = (req,res)=>{

    console.log("req.query",req.query)
    console.log("req.query.id",req.query.id)
    var schedule_obj_id = req.query.id ;

    console.log("req.query.status",req.query.status)
    var status = req.query.status ;

    if(status == "true"){ 
        var newstatus = "false" ;
    }else{
        var newstatus = "true" ;
    }

    models.Userdb.updateOne(
        { _id : data.user._id , "schedule.schedule_index" : schedule_obj_id }, {$set : {"schedule.$.schedule_checkbox": newstatus}}
        ) 
        .then(user => {
            models.Userdb.findOne({ _id :  data.user._id})
                .then(user=>{
                    req.session.update_data = user;
                    console.log(".......................................req.session.update_data",req.session.update_data)
                    res.redirect("/schedule");
                })
                .catch(err=>{
                    res.redirect("/home");
                })
        })
        .catch(err => {
            console.log("..............................................err",err)
            res.redirect("/emaillogin");
        })
}

const delete_timer_checkbox = (req,res)=>{
    console.log("req.query",req.query)

    console.log("req.query.id",req.query.id)
    var schedule_obj_id = req.query.id ;

    console.log("req.query.id",req.query.status)
    var status = req.query.status ;

    console.log("req.query.timer_id",req.query.timer_id)
    var timer_id = parseInt( req.query.timer_id );

    if(status == "true"){ 
        var newstatus = "false" ;
    }else{
        var newstatus = "true" ;
    }

    models.Userdb.updateOne(
        { _id : data.user._id }, 
        {$set : {"schedule.$[s].slots.$[si].checkbox": newstatus} },
        {arrayFilters : [{'s.schedule_index':schedule_obj_id},{'si.id': timer_id}] }
        ) 
            .then(user => {
                models.Userdb.findOne({ _id :  data.user._id})
                .then(user=>{
                    req.session.update_data = user;
                    console.log(".......................................req.session.update_data",req.session.update_data)
                    res.redirect("/schedule");
                })
                .catch(err=>{
                    res.redirect("/home");
                })
        })
        .catch(err => {
            console.log("..............................................err",err)
            res.redirect("/emaillogin");
        })

}

const filterdemo = (req,res) => {


    models.Userdb.find({"doctor" : "doctor"})
    .select({name : 1 ,_id : 1,specification:1,hospital:1,qualification:1,experience:1,city:1,fees:1,state:1,colony:1}) 
    .then(user=>{
        
        var all_doc_check = user;
        console.log("......................................all_doc_check",all_doc_check)
        
        
        var a = req.body.city;
        var b = req.body.hospital;
        var c = req.body.experience;
        var emp =[];
        if(a != undefined) {
            emp.push(a);
        }
        if(b != undefined) {
            emp.push(b);
        }
        if(c != undefined) {
            emp.push(c);
        }

        console.log("emparray",emp)
        

    
        console.log("aaaaaaaaa",a);
        console.log("bbbbbbbbbbbbb",b);
        console.log("ccccccccccccccc",c);
       
        var match = [{ "doctor" :  "doctor"}];
        
        if(a == undefined) {
            a = [];
         }
        if(b == undefined) {
           b = [];
        }
         if(c == undefined) {
            c = [];
         }
    
        if(typeof(a)== "string") {
            match.push({city : {$regex : a}})
        }
        else {
    
            for(var i=0;i <a.length; i++) {
                match.push({city : {$regex : a[i]}})
            }
        }
        
        if(typeof(b)== "string") {
           
            match.push({hospital : {$regex : b}}) 
        }
        else {
    
            for(var i=0;i <b.length; i++) {
                match.push({hospital : {$regex : b[i]}})
            }
        }
        if(typeof(c)== "string") {
            match.push({experience : {$regex : c}})
        }
        else {
    
            for(var i=0;i < c.length; i++) {
                match.push({experience : {$regex : c[i]}})
            }
        }
        console.log("match",match);
       
        var query = { "$and" : [] }
    
        for (var i = 0; i < match.length; i++) {
            query["$and"].push( match[i] );
        }
       
        console.log("queryyyyyyyyyyyyyyyyyyyyyyy",query);
    
    
        models.Userdb.find(query)
        .select({name : 1 ,_id : 1,specification:1,hospital:1,qualification:1,experience:1,city:1,fees:1,state:1,colony:1}) 
        .then(user=>{
            console.log("......................................doctors specific data",user)
    
            res.render("filterdemo", data = { user: false , doctors :user ,all_doc_check : all_doc_check ,emp : emp});
           
        })
        .catch(err=>{
            res.redirect("/home");
        })
       
    })
    .catch(err=>{
        res.redirect("/home");
    })

}

const filter = (req,res) => {
    var a = req.body.city;
    var b = req.body.hospital;
    var c = req.body.experience;

    console.log("aaaaaaaaa",a);
    console.log("bbbbbbbbbbbbb",b);
    console.log("ccccccccccccccc",c);
   
    var match = [{ "doctor" :  "doctor"}];
    
    if(a == undefined) {
        a = [];
     }
    if(b == undefined) {
       b = [];
    }
     if(c == undefined) {
        c = [];
     }

    if(typeof(a)== "string") {
        match.push({city : {$regex : a}})
    }
    else {

        for(var i=0;i <a.length; i++) {
            match.push({city : {$regex : a[i]}})
        }
    }
    
    if(typeof(b)== "string") {
       
        match.push({hospital : {$regex : b}}) 
    }
    else {

        for(var i=0;i <b.length; i++) {
            match.push({hospital : {$regex : b[i]}})
        }
    }
    if(typeof(c)== "string") {
        match.push({experience : {$regex : c}})
    }
    else {

        for(var i=0;i < c.length; i++) {
            match.push({experience : {$regex : c[i]}})
        }
    }
    console.log("match",match);
   
    var query = { "$and" : [] }

    for (var i = 0; i < match.length; i++) {
        query["$and"].push( match[i] );
    }
   
    console.log("queryyyyyyyyyyyyyyyyyyyyyyy",query);
    /*
    
    models.user_schema.find({ "doctor" :  "doctor"})
    .select({name : 1 ,_id : 1,specification:1,hospital:1,qualification:1,experience:1,city:1,fees:1,file:1,state:1,colony:1}) 
    */
    models.Userdb.find(query).select({ "name" : 1 }) // just get _id's for easy reading
    .then(user => {
        console.log("filterrrrrr userr",user)
        console.log(".........................................................")

    })
    .catch(err =>{
        console.log("errrrr  filter",err)
    })
    }

const getschedule = (req,res)=>{
        var ids = req.query.docid ;
        console.log("ids = ",ids);
    
        models.Userdb.findOne({_id : ids})
        .select({schedule:1}) 
        .then(user=>{
            console.log("user_array = ",user);
            console.log("user_array = ",user.schedule[0].day);
    
    
            var schedule = user.schedule;
            // console.log(`schedule = `, schedule);
            var days = [ [],[],[],[],[],[] ];
            var y = -1 ;
            var y2 = -1;
            var y3 = -1;
            var y4 = -1;
            var y5 = -1;
            var y6 = -1;
    
            for(var j = 0 ; j < schedule.length ; j++){
                var hi = schedule[j].day ;
                console.log("hi",hi)
    
                if( "Monday" == hi ){
                    console.log("Monday", hi)
                    var x = 0;
                    if(y > x){
                        console.log("y run....")
                      days[0][y] = schedule[j] ;
                    }else{
                    console.log("else   run....")
                      days[0][x] = schedule[j] ;
                        y = x;
                        y++;
                    }
                }
                else if( "Tuesday"  == hi ){
                    console.log("Tuesday", hi)
                    var x2 = 0;
                    var sub_arr2;
                    if(y2>0){
                        console.log("y run....")
                      days[1][y2] = schedule[j] ;
                    }else{
                        console.log("else run....")
                      days[1][x2] = schedule[j] ;
                        y2 = x2;
                        y2++;
                    }
                }
                else if( "Wednesday"  == hi ){
                    console.log("Wednesday" , hi)
                    var x3 = 0;
                    if(y3>0){
                        console.log("y run....")
                      days[2][y3] = schedule[j] ;
                    }else{
                        console.log("else run....")
                      days[2][x3] = schedule[j] ;
                        y3 = x3;
                        y3++;
                    }
                }
                else if( "Thursday"  == hi ){
                    console.log("Thursday" , hi)
                    var x4 = 0;
                    if(y4>0){
                        console.log("y run....")
                      days[3][y4] = schedule[j] ;
                    }else{
                        console.log("else run....")
                      days[3][x4] = schedule[j] ;
                        y4 = x4;
                        y4++;
                    }
                }
                else if( "Friday"  == hi ){
                    console.log("Friday" , hi)
                    var x5 = 0;
                    if(y5>0){
                        console.log("y run....")
                      days[4][y5] = schedule[j] ;
                    }else{
                        console.log("else run....")
                      days[4][x5] = schedule[j] ;
                        y5 = x5;
                        y5++;
                    }
                }
                else if("Saturday" == hi){
                    console.log("Saturday" , hi)
                    var x6 = 0;
                    if(y6>0){
                        console.log("y run....")
                      days[5][y6] = schedule[j] ;
                    }else{
                        console.log("else run....")
                      days[5][x6] = schedule[j] ;
                        y6 = x6;
                        y6++; 
                    }
                }
            }
             console.log("days = ",days);
             console.log("days = ",days.length);

            // var days = [["1m"],["2t"],["3w"],["4th"],["5f"],["6sa"]]
    
            var d = new Date();
            var n = d.getDay()
            console.log("n = ",n); 
            // n = 3;
            var newdays = [];
            for(var x = 0 ; x < days.length ; x++){
            
                if(n == 0 || n == 7){
                        // console.log("x,n = ",x,n)
                        newdays.push([])
                        // console.log("newdays = ",newdays)
                    n++ ;
                }
                if(n > days.length){
                    // console.log("x,n = ",x,n)
                    newdays.push(days[n - (days.length + 1 + 1)])
                    // console.log("newdays = ",newdays)
                    n++ ;
                }else{
                    // console.log("x,n = ",x,n)
                    newdays.push(days[n-1])
                    // console.log("newdays = ",newdays)
                    n++ ;
                }
            }
            
            console.log("newdays = ",newdays)
    
            var summ = 0 ;
            var sumarray = [];
    
            console.log("  newdays.length ",newdays.length)
    
            for(var kk = 0 ; kk < newdays.length ; kk++) { 
                console.log(` newdays[${kk}].length `,newdays[kk].length)
                if(newdays[kk].length != 0){
                    for( var ll = 0 ; ll < newdays[kk].length ; ll++ ){
                        var totalslot =0;
                        for( var lll = 0 ; lll < newdays[kk][ll].slots.length ; lll++ ){
                            if(newdays[kk][ll].slots[lll].isbook == "false"){
                                totalslot++ ;
                            }
                        }
                       // var totalslot = newdays[kk][ll].slots.length ;
                        summ = summ + totalslot ;
                        console.log(`........${kk}..summ = `,summ)
                    }
                    sumarray.push(summ);
                    console.log("sumarray.................",sumarray) ;
    
                    summ = 0 ;
                }else{
                    sumarray.push(newdays[kk].length);
                    console.log("sumarray.................",sumarray) ;
                }
           }
    
           console.log("sumarray.................",sumarray) ;
    
            user.schedule = sumarray ;
    
    
            res.send(user)
        })
        .catch(err=>{
            res.send("/home");
        })
    }

    

    const setschedule = (req,res)=>{
        var ids = req.query.docid ;
        console.log("ids = ",ids);
    
        var clickday = req.query.clickday ;
        console.log("clickday = ",clickday);
    
        models.Userdb.findOne({_id : ids})
        .select({schedule:1}) 
        .then(user=>{
            var objarray =[];
            for(var i =0 ;i < user.schedule.length ;i++){
                if( user.schedule[i].day == clickday ){
                    objarray.push(user.schedule[i])
                }
            }
            console.log("objarray = ",objarray);
            res.send(objarray)
        })
        .catch(err=>{
            res.send("/home");
        })
    }

  //
 






    //

    const patientappointment = (req,res)=>{

        var obj = {
            name :req.body.doctorname,
            username :req.body.username,
            bookhospital:req.body.bookhospital,
            appointmentdate : req.body.appointmentdate ,
            stime: req.body.stime ,
            etime: req.body.etime,
            hospital: req.body.hospital,
            qualification: req.body.qualification,
            doctorid:req.body.doctorid,
            schedule_obj_id:req.body.scheduleid,
            timer_id:req.body.slotid
        }
        var newstatus = "true" ;
        var schedule_obj_id = req.body.scheduleid ;
        var timer_id = parseInt( req.body.slotid ) ;
    
        console.log("log patientappointment obj ",obj ) ;
        console.log(" newstatus = ",newstatus ) ;
        console.log(" schedule_obj_id = ",schedule_obj_id ) ;
        console.log(" timer_id = ",timer_id ) ;
    
        models.Userdb.updateOne( { _id : data.user._id},
              { $push:{appointments:
            {   _id:ObjectID(),        
                name :req.body.doctorname,
                username :req.body.username,
                bookhospital:req.body.bookhospital,
                appointmentdate : req.body.appointmentdate ,
                stime: req.body.stime ,
                etime: req.body.etime,
                hospital: req.body.hospital,
                qualification: req.body.qualification,
                doctorid:req.body.doctorid,
                scheduleid:schedule_obj_id,
                slotid:timer_id
              }}})
        .then(response => {
    
            models.Userdb.findOne({ _id :  data.user._id})
            .select({appointments:1})
            .then(user=>{
    
                console.log("..............patientappointment objid find... user._id  = ",user._id ) ;
                console.log("..............patientappointment objid find... user  = ",user ) ;
                console.log("..............patientappointment objid find... user.appointments[appointments.length-1]._id   = ",user.appointments[user.appointments.length-1]._id ) ;
    
                var currentuser = user._id  ;
                var appointmentid = user.appointments[user.appointments.length-1]._id   ;
    
    
                models.Userdb.updateOne( { _id : req.body.doctorid  },
                    { $push:{appointments:
                    { _id:ObjectID(),        
                      name :req.body.patname,
                      username :req.body.username,  
                      number :req.body.mobile,
                      patientnumber :req.body.patientmobile,
                      email :req.body.email,
                      bookhospital:req.body.bookhospital,
                      appointmentdate : req.body.appointmentdate ,
                      stime: req.body.stime ,
                      etime: req.body.etime,
                      userid : currentuser ,
                      userappointmentid : appointmentid ,
                      cancel:""
                    }}}) 
                    .then(response => {
                            models.Userdb.updateOne(
                                { _id : req.body.doctorid }, 
                                {$set : {"schedule.$[s].slots.$[si].isbook": "true"} },
                                {arrayFilters : [{'s.schedule_index':schedule_obj_id},{'si.id': timer_id}] }
                                ) 
                                .then(user => {
                                    models.Userdb.findOne({ _id :  data.user._id})
                                    .then(user=>{
                                        req.session.update_data = user;
                                        res.redirect("/confirmappointment");
                                    })
                                    .catch(err=>{
                                        res.redirect("/home");
                                    }) 
                                })
                                .catch(err => {
                                    console.log("..............................................err",err)
                                    res.redirect("/emaillogin");
                                })
                    })
                    .catch(err => {
                            console.log("..............................................err",err)
                            res.redirect("/emaillogin");
                    })      
            })
            .catch(err=>{
                res.redirect("/home");
            })
    
    
        })
        .catch(err => {
            console.log("..............................................err",err)
            res.redirect("/emaillogin");
        }) 
    }
    const confirmdeleteappointment = (req,res)=>{

        var hulk = req.query.objid ;
    
        console.log("...................... bookhospital ......hulk",hulk)
        
        models.Userdb.updateOne({"_id":data.user._id},{$pull:{ "appointments":{"_id":ObjectID(`${hulk}`)}}} )
        .then(user => {
    
            models.Userdb.findOne({ _id :  req.query.doctorid })
            .select({appointments:1})
            .then(user=>{
     
                console.log(" appointmentid ", user.appointments[user.appointments.length-1]._id )
                var appointmentid = user.appointments[user.appointments.length-1]._id   ;
                models.Userdb.updateOne({"_id":  req.query.doctorid },{$pull:{ "appointments":{"_id":ObjectID(`${appointmentid}`)}}} )
                .then(user => {
    
                    console.log(" req.query.scheduleid", req.query.scheduleid)
                    console.log(" req.query.slotid", req.query.slotid)
            
                    models.Userdb.updateOne(
                        { _id : req.query.doctorid }, 
                        {$set : {"schedule.$[s].slots.$[si].isbook": "false"} },
                        {arrayFilters : [{'s.schedule_index': req.query.scheduleid},{'si.id': parseInt(req.query.slotid)}] }
                        ) 
                        .then(user => {       
                                models.Userdb.findOne({ _id :  data.user._id})
                                .then(user=>{
                                    req.session.update_data = user;
                                    res.redirect("/appointment");
                                })
                                .catch(err=>{
                                    res.redirect("/home");
                                })
                        })
                        .catch(err => {
                            console.log("..............................................err",err)
                            res.redirect("/emaillogin");
                        })    
    
                })
                .catch(err=>{
                    res.redirect("/home");
                })
            })
            .catch(err=>{
                res.redirect("/home");
            })
    
    
            // console.log(" req.query.doctorid", req.query.doctorid)
        })
        .catch(err => {
            console.log("..............................................err",err)
            res.redirect("/emaillogin");
        })
    
    
    }

    const deleteappointment = (req,res)=>{

        var hulk = req.query.objid  ;                           
        var appointmentdate = req.query.appointmentdate ;
        var stime = req.query.stime ;
    
        console.log("...................... bookhospital ......hulk",hulk)
        console.log("...................... appointmentdate",appointmentdate)
        console.log("...................... bookhospital ......stime",stime)
        
        models.Userdb.updateOne({"_id":data.user._id},{$pull:{ "appointments":{"_id":ObjectID(`${hulk}`)}}} )
        .then(user => {
    
            models.Userdb.findOne({ _id :  req.query.doctorid })
            .select({appointments:1})
            .then(user=>{
                var x ;
                for(var i = 0 ; i < user.appointments.length ; i++){
                    if(user.appointments[i].appointmentdate == appointmentdate && user.appointments[i].stime == stime){
                        x = user.appointments[i]._id ;
                    }
                }
     
                console.log(" xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx appointmentid ", x )
                var appointmentid = x    ;
                models.Userdb.updateOne({"_id":  req.query.doctorid },{$pull:{ "appointments":{"_id":ObjectID(`${appointmentid}`)}}} )
                .then(user => {
    
                    console.log(" req.query.scheduleid", req.query.scheduleid)
                    console.log(" req.query.slotid", req.query.slotid)
            
                    models.Userdb.updateOne(
                        { _id : req.query.doctorid }, 
                        {$set : {"schedule.$[s].slots.$[si].isbook": "false"} },
                        {arrayFilters : [{'s.schedule_index': req.query.scheduleid},{'si.id': parseInt(req.query.slotid)}] }
                        ) 
                        .then(user => {       
                                models.Userdb.findOne({ _id :  data.user._id})
                                .then(user=>{
                                    req.session.update_data = user;
                                    res.redirect("/appointment");
                                })
                                .catch(err=>{
                                    res.redirect("/home");
                                })
                        })
                        .catch(err => {
                            console.log("..............................................err",err)
                            res.redirect("/emaillogin");
                        })    
                        
                })
                .catch(err=>{
                    res.redirect("/home");
                })
            })
            .catch(err=>{
                res.redirect("/home");
            })
    
    
        })
        .catch(err => {
            console.log("..............................................err",err)
            res.redirect("/emaillogin");
        })
    
    
    }
    const adminallappointment = (req,res)=>{
        console.log("adminallappointment ",req.query.userid)
    
        models.Userdb.findOne( { _id :  req.query.userid }  )
        .then(user => {
            console.log("user = ",user)
    
            if(req.session.update_data){
                if(req.session.admin_update_data){
                    res.render("appointment", data = { user: user ,admin : req.session.admin_update_data });
                }else{
                    res.render("appointment", data = { user: req.session.update_data ,admin : req.session.userid.user });
                }
            }else{
                res.render("appointment", data = { user: user ,admin : req.session.userid.user });
            }
        })
        .catch(err => {
            res.status(500).send({ message : err.message || "Error Occurred while retriving user information for update" })
        })
    
    }
    const searchSuggestions =(req,res)=>{
        models.Userdb.find({doctor : "doctor"})
        .select({name:1,hospital:1,specification:1}) 
        .then(user => {
            console.log("allsearchthing = ",user)
            var arrsea=[];
            for(var i=0; i < user.length; i++){
                arrsea.push(user[i].name+"n")
                var hosp = user[i].hospital.split(",")
                for(var j=0; j < hosp.length; j++){
                arrsea.push(hosp[j]+"h")
                }
               
                var spec = user[i].specification.split(",")
                for(var k=0; k < spec.length; k++){

                arrsea.push(spec[k]+"s")
                }


            }
            console.log("arrsea",arrsea)
            
            console.log("arrsea.lowecase",arrsea.map(name=>name.toLowerCase()))
            // names.map(name => name.toUpperCase());

            function getUnique(arrsea){
                var uniqueArray = [];
                
                // Loop through array values
                for(i=0; i < arrsea.length; i++){
                    if(uniqueArray.indexOf(arrsea[i]) === -1) {
                        uniqueArray.push(arrsea[i]);
                    }
                }
                return uniqueArray;
            }
            
            // var names = ["John", "Peter", "Clark", "Harry", "John", "Alice"];
            var uniqueNames = getUnique(arrsea);
            console.log("uniqueNames",uniqueNames); // Prints: ["John", "Peter", "Clark", 

            res.send(uniqueNames)
        })
        .catch(err => {
            console.log("err = ",err)
        })
    }

    const hospitaladminform = (req,res)=>{
        console.log("req.body.name = ",req.body.name)
        console.log("req.body.bed = ",req.body.bed)
        console.log("req.body.speciality = ",req.body.speciality)
        console.log("req.body.address = ",req.body.address)
        console.log("req.body.treatment = ",req.body.treatment)
        console.log("req.body.discription = ",req.body.discription)
        console.log("req.file.filename = ",req.file.filename)
    
    
            models.hospital_list.updateOne( {'_id' : req.body.id}, 
                {$set:{
                    name : req.body.name ,
                    bed : req.body.bed ,
                    speciality : req.body.speciality ,
                    address : req.body.address ,
                    treatment : req.body.treatment ,
                    discription : req.body.discription ,
                    file : req.file.filename
                }}  )
            .then(data => {
                console.log(" ................................hos up succ") ;
                res.redirect('hospitaladmin')
            })
            .catch(err =>{
                res.status(500).send({
                    message : err.message || "Some error occurred while creating a create operation"
                });
            });
    
    }

    const updatenumber = (req,res)=>{ 

        var currentnumber = req.body.currentnumber ;
        console.log("currentnumber = ",currentnumber)
        
            var newnumber = req.body.newnumber ;
            req.session.newnumber = req.body.newnumber ;
            console.log("newnumber = ",newnumber)
    
        axios.post(`http://localhost:3000/otp/${currentnumber}`)
        .then(response =>{
    
            console.log("..........................................response.data ", response.status)
        
            req.session.otp_succ = "otp valid for 30sec" ;
            req.session.numberupdate = currentnumber ;
            res.redirect("../otpnew") ;        
        })
        .catch(err =>{
            res.send(err);
        })
            
    }

    const otp_send_new =(req, res)=> {
        console.log("..........................................post otp_send")
    
        var otp_number = req.body.input1 + req.body.input2 + req.body.input3 + req.body.input4 ;
    
        var mobile_number = req.session.numberupdate ;
    
        delete req.session.numberupdate ;
    
        console.log(".......................................mobile_number = ",`${mobile_number}`)
        console.log(".......................................otp_number = ",`${otp_number}`)
    
        axios.get(`http://localhost:3000/otp/${mobile_number}/${otp_number}`)
        .then(response => {
            console.log(" .............................post..otp_send then() ")
            console.log("..............................otp verified working = ",response.data)
        
            req.session.message = { success: { head: "Success", body: "number update " } };
            res.redirect('/updatenumbercomp');
             
        })
        .catch(err => {
            console.log(" ...............................otp_send catch() ")
            console.log("..............................err.response.status:", err.response.status)
    
            if( 404 == err.response.status ){
                req.session.otp_err = "enter correct otp"
                res.redirect('/otp');
            }
            if( 409 == err.response.status ){
                req.session.otp_err = "The code has already been verified";
                res.redirect('/otp');
            }
            if( 410 == err.response.status ){
                req.session.otp_err = "The code is expired";
                res.redirect('/otp');
            }
            res.status(500).send({ message : err.message || "Error Occurred while retriving user information" })
        })
    }

    const updatenumbercomp = (req,res)=>{
    
        var newnumber = req.session.newnumber ;
        console.log("newnumber = ",newnumber)
        
        if(req.session.userid.user.type == "admin"){
            if(data.user){
                var id = data.user._id ;
            }else{
                var id = req.session.userid.user._id ;
                req.session.adminprofileupdate = true ;
            }
        }else{
            var id = req.session.userid.user._id ;
        }
        
        models.Userdb.updateOne( { _id :  id }, {$set:{"mobileNo" : newnumber }}  )
        .then(user => {
            console.log("profile updata succsesful")
            req.session.update_profile = "number update successfuly" ;
        
            models.Userdb.findOne({ '_id' : id})
            .then(user=>{
                req.session.update_data = user;
                console.log(".......................................req.session.update_data",req.session.update_data)
                if(req.session.userid.user.type == "admin"){
                    if(data.user){
                        if(data.user.type == "doctor"){
                                res.redirect("/doctoradmin");
                        }else{
                            res.redirect("/useradmin");
                        }
                    }else{
                        req.session.admin_update_data = user;
                        res.redirect("/profile");
                    }
                }else{
                    res.redirect("/profile");
                }
            })
            .catch(err=>{
                res.redirect("/home");
            })
        })
        .catch(err => {
            res.status(500).send({ message : err.message || "Error Occurred while retriving user information for update" })
        })
    
}
    
module.exports = {
    
    checkMainLogin : checkMainLogin,
    checkpreLogin : checkpreLogin ,
    checkLogin : checkLogin,
    signup : signup,
    emaillogin : emaillogin,
    logout : logout,
    forgot_password: forgot_password,
    otp_create: otp_create,
    otp_send : otp_send,
    otp_verifi: otp_verifi,
    create_password,create_password,
    phonelogin:phonelogin,
    profile : profile,
    update_profile:update_profile,
    medical_record : medical_record,
    show_record : show_record,
    delete_record : delete_record,
    medical_report : medical_report,
    add_record_photo : add_record_photo,
    delete_record_photo : delete_record_photo,
    schedule_form : schedule_form,
    delete_schedule : delete_schedule,
    schedule_checkbox : schedule_checkbox,
    delete_timer_checkbox : delete_timer_checkbox,
    filter : filter,
    filterdemo: filterdemo,
    getschedule : getschedule,
   
    setschedule : setschedule,
  
    patientappointment : patientappointment,
    deleteappointment : deleteappointment,
    adminallappointment : adminallappointment,
    searchSuggestions : searchSuggestions,
    signupdoc : signupdoc,
    signupdocnew : signupdocnew,
    hospitaladminform : hospitaladminform,
    updatenumber : updatenumber,
    otp_send_new : otp_send_new,
    updatenumbercomp : updatenumbercomp,
    confirmdeleteappointment : confirmdeleteappointment


}