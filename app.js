//const mongoose = require ("mongoose")
const express = require('express');
const morgan = require('morgan')
const bodyparser = require("body-parser")
const path = require('path');
//const ejs = require('ejs');
//const dotenv = require ("dotenv");
const session = require('express-session');
const fetch = require('node-fetch');

const connectDB = require('./server/database/connection');
const app = express();
const PORT = process.env.PORT || 3000;
//log request
app.use(morgan('tiny'));

//mongodb connectn
connectDB();

//parse-request
app.use(bodyparser.urlencoded({extended:true}));

//set app engine, ejs file
app.set('view engine', 'ejs');
//app.set('views', template_path);
//ejs.registerPartials(partials_path);


//const template_path = path.join(__dirname, "/templates/views");
//const partials_path = path.join(__dirname, "/templates/partials");


// load css files
app.use(express.static("assets"));
app.use('/css', express.static(path.resolve(__dirname, "assets/css")))



app.use(session({
	secret: 'SavingLife',
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: 1000 * 60 *60,
		sameSite: true,
		secure: false
	}
}));
// load routers
app.use('/', require('./server/routes/router'))




















/*
  
*/

app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`);
})


/*

//log request
app.use(morgan('tiny'));

//parse-request
app.use(bodyparser.urlencoded({extended:true}));

console.log(path.join(__dirname));
const static_path = path.join(__dirname);
//const template_path = path.join(__dirname, "/templates/views");
//const partials_path = path.join(__dirname, "/templates/partials");

app.set('view engine', 'ejs');
//app.set('views', template_path);
//ejs.registerPartials(partials_path);





app.use(express.static(static_path));

app.use("/css",express.static(path.resolve(__dirname,"assets/css")))

const connectDB = require('./server/database/connection');
connectDB();



/*const DB = "mongodb+srv://chiranjiv:chiranjivpatle@cluster0.9xfil.mongodb.net/tvastra_database?retryWrites=true&w=majority"

mongoose.connect(DB,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() =>{
    console.log("connection succesful");
}).catch((err)=>console.log("no connection"));
*/

/*//Middleware
const middleware = (req,res,next)=>{
    console.log("Hello my middlewaree");
    next();
}
*/




/*app.get('/', (req,res) => {
    res.render('index');
});

app.get('/doctor', (req,res) => {
    res.render('doctor');
});

app.get('/hospital', (req,res) => {
    res.render('hospital');
});

app.get('/dentistry', (req,res) => {
    res.render('dentistry');
});

app.get('/contactus', (req,res) => {
    res.render('contactus');
});

app.get('/aboutus', (req,res) => {
    res.render('aboutus');
});

app.get('/login', (req,res) => {
    res.render('login');
});

app.get('/signup', (req,res) => {
    res.render('signup');
});

app.get('/createpassword', (req,res) => {
    res.render('createpassword');
});

app.get('/emaillogin', (req,res) => {
    res.render('emaillogin');
});


app.get('/tvastraplus', (req,res) => {
    res.render('tvastraplus');
});

app.get('/doctors_profile', (req,res) => {
    res.render('doctors_profile');
});

app.get('/about-hospital', (req,res) => {
    res.render('about-hospital');
});

app.get('/submit-your-query', (req,res) => {
    res.render('submit-your-query');
});

app.get('/bookappointment', (req,res) => {
    res.render('bookappointment');
});

app.get('/otp', (req,res) => {
    res.render('otp');
});*/


