const express = require ("express");
const router = express.Router()


//const services = require('../services/render');
const loginController = require("../controller/loginController")
const mainController = require("../controller/mainController")

const path = require('path');
const multer = require('multer');


// multer fo single file
var storage = multer.diskStorage({
    destination: "./assets/uploads/",
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });

var upload = multer({ storage:storage })

// multer fo mul file

//const controller = require('../controller/controller');
//const Userdb = require("../model/model");



router.route("/").get(loginController.checkMainLogin);
router.route("/emaillogin").get(loginController.checkpreLogin,mainController.emaillogin);
router.route("/emaillogin").post(loginController.emaillogin);


router.route("/home").get(loginController.checkLogin,mainController.home);


router.route("/forgot_password").post(loginController.forgot_password);
router.route("/phonelogin").get(mainController.phonelogin);
router.route("/phonelogin").post(loginController.phonelogin);

router.route("/otp/:token").post( loginController.otp_create );
router.route("/otp").get(mainController.otp);
router.route("/otp_send").post(loginController.otp_send);
router.route("/otp/:token/:code").get( loginController.otp_verifi );

router.route("/create_password").get(mainController.create_password);
router.route("/create_password").post(loginController.create_password);

router.route("/doctor").get(loginController.checkLogin,mainController.doctor);
router.route("/doctor").post(mainController.doctor);

router.route("/hospital").get(loginController.checkLogin,mainController.hospital);

router.route("/aboutus").get(loginController.checkLogin,mainController.aboutus);
router.route("/tvastraplus").get(loginController.checkLogin,mainController.tvastraplus);

router.route("/contactus").get(loginController.checkLogin,mainController.contactus);
router.route("/dentistry").get(loginController.checkLogin,mainController.dentistry);
router.route("/submit_your_query").get(loginController.checkLogin,mainController.submit_your_query);
router.route("/faq").get(loginController.checkLogin,mainController.faq);





router.route("/signup").get(mainController.signup);
router.route("/signup").post(upload.single('file'),loginController.signup);
router.route("/signupdoc").post(upload.single('file'),loginController.signupdoc);
router.route("/signupdocnew").post(upload.single('file'),loginController.signupdocnew);


router.route("/logout").get(loginController.logout);
router.route("/profile").get(mainController.profile);//loginController.profile ,

router.route("/setting").get(mainController.setting);
router.route("/update_profile").post(upload.single('file'),loginController.update_profile);
router.route("/appointment").get(mainController.appointment);

router.route("/medical_report").get(loginController.medical_report ,mainController.medical_report);

router.route("/medical_record").post(upload.array('record_photos',5),loginController.medical_record);

router.route("/show_record").post( loginController.show_record,mainController.show_record );

router.route("/delete_record").post(loginController.delete_record);
router.route("/add_record_photo").post(upload.array('record_photos',5),loginController.add_record_photo);
router.route("/show_record").get( loginController.show_record,mainController.show_record );

router.route("/delete_record_photo").post(loginController.delete_record_photo);

router.route("/schedule").get( mainController.schedule );
router.route("/schedule_form").post( loginController.schedule_form );

router.route("/delete_schedule").get( loginController.delete_schedule ); 

router.route("/schedule_checkbox").get( loginController.schedule_checkbox ); 
router.route("/delete_timer_checkbox").get( loginController.delete_timer_checkbox ); 

router.route("/filterdemo").get( loginController.filterdemo ); 
router.route("/filterdemo").post( loginController.filterdemo ); 
router.route("/admin2users").get( mainController.admin2users ); 

router.route("/getschedule").get( loginController.getschedule ); 


router.route("/setschedule").get( loginController.setschedule ); 
router.route("/patientappointment").get( mainController.patientappointment ); 
router.route("/patientappointment").post( loginController.patientappointment ); 
router.route("/confirmdeleteappointment").get( loginController.confirmdeleteappointment ); 


router.route("/confirmappointment").get( mainController.confirmappointment ); 
router.route("/deleteappointment").get( loginController.deleteappointment ); 
router.route("/reschedule").get( mainController.reschedule ); 


router.route("/updatereschedule").get( mainController.updatereschedule ); 
router.route("/admin").get(loginController.checkLogin,mainController.admin);
router.route("/useradmin").get( mainController.useradmin ); 
router.route("/admineditprofile").get( mainController.admineditprofile ); 
router.route("/adminallappointment").get(loginController.adminallappointment);
router.route("/doctoradmin").get( mainController.doctoradmin ); 
router.route("/admindoctorallappointment").get( mainController.admindoctorallappointment ); 

router.route("/update_mob").post( mainController.update_mob ); 
router.route("/searchSuggestions").get( loginController.searchSuggestions ); 

router.route("/hospitaladmin").get( mainController.hospitaladmin );
router.route("/hospitaladminform").get( mainController.hospitaladminform ); 
router.route("/hospitaladminform").post(upload.single('file'), loginController.hospitaladminform ); 

router.route("/cancelappointmentadmin").get( mainController.cancelappointmentadmin ); 


router.route("/updatenumber").post( loginController.updatenumber ); 
router.route("/otpnew").get(mainController.otpnew);
router.route("/otp_send_new").post(loginController.otp_send_new);
router.route("/updatenumbercomp").get(loginController.updatenumbercomp);




















module.exports = router ;



















/*
route.get('/', services.index);
  route.get('/doctor',  services.doctor)
  route.get('/hospital',  services.hospital)
  route.get('/dentistry', services.dentistry )
  route.get('/about-hospital', services.about_hospital )

  route.get('/aboutus', services.aboutus )
  route.get('/bookappointment', services.bookappointment )
  route.get('/contactus', services.contactus )
  route.get('/createpassword', services.createpassword )
  route.get('/doctors_profile', services.doctors_profile )

  route.get('/emaillogin', services.emaillogin )
  route.get('/faq', services.faq )
  route.get('/login', services.login )
  route.get('/signup', services.signup )
  route.get('/otp', services.otp )

  route.get('/submit-your-query', services.submit_your_query )
  route.get('/tvastraplus', services.tvastraplus )
 /* route.get('/phone_login', services.phone_login )*/



/*

 // API
 
route.post('/api/users', controller.create);
route.post('/login', async (req,res) =>{
    try {
        const email = req.body.email;
        const password = req.body.password;

        const useremail =await Userdb.findOne({email:email});
       
        if(useremail.password === password) {
            res.status(201).render("index");
        }
        else {
            res.render("emaillogin");
        }
    }catch(error){

       //res.status(400).send("invalid email");
        res.render("emaillogin");
    }
})
route.get('/api/users', controller.find);
route.put('/api/users/:id', controller.update);
route.delete('/api/users/:id', controller.delete);

module.exports = route;

*/