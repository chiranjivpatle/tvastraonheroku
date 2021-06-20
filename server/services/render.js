/*

const axios = require('axios');

exports.index = (req, res) => {
    // Make a get request to /api/users
    axios.get('http://localhost:3000/api/users')
        .then(function(response){
            console.log(response.data);
            res.render('index', { users : response.data });
        })
        .catch(err =>{
            res.send(err);
        })

    
}
//exports.index = (req, res) => {
 //   res.render('index',{users: "New data"});
//}
exports.doctor = (req, res) => {
res.render('doctor');
}
exports.hospital = (req, res) => {
res.render('hospital');
}
exports.dentistry = (req, res) => {
res.render('dentistry');
}
exports.about_hospital = (req, res) => {
res.render('about-hospital');
}
exports.aboutus = (req, res) => {
res.render('aboutus');
}
exports.bookappointment = (req, res) => {
res.render('bookappointment');
}
exports.contactus = (req, res) => {
res.render('contactus');
}
exports.createpassword = (req, res) => {
res.render('createpassword');
}
exports.doctors_profile = (req, res) => {
res.render('doctors_profile');
}
exports.emaillogin = (req, res) => {
res.render('emaillogin');
}
exports.faq = (req, res) => {
res.render('faq');
}
exports.login = (req, res) => {
res.render('login');
}
exports.signup = (req, res) => {
res.render('signup');
}
exports.otp = (req, res) => {
res.render('otp');
}
exports.submit_your_query = (req, res) => {
res.render('submit-your-query');
}
exports.tvastraplus = (req, res) => {
res.render('tvastraplus');
}

/*exports.phone_login = (req, res) => {
res.render('phone_login');
}*/
