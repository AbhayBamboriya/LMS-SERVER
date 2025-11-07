import express from 'express'
import userRoutes from './routes/user.Routes.js'
import cors from 'cors'
import cookieParser  from 'cookie-parser'
import morgan from 'morgan';
import courseRoute from './routes/course.routes.js'
import paymentsRoute from './routes/payment.routes.js'
import errorMiddleware from './middleware/error.middleware.js';
import misllaneousRoutes from './routes/misllaneous.routes.js'
const app=express()
// Enable CORS for all routes
app.use((req, res, next) => {
    // res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    // res.header('Access-Control-Allow-Methods', '*');
    // res.header('Access-Control-Allow-Headers', '*');
    // res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization,GET , POST');
    next();
});
// for parsing to json data directly
app.use(express.json());
app.use(express.urlencoded({extended:true}))        //it will extract out the query params from url
app.use(morgan('dev'))  //morgan will track all the access point or to which url the request made at localhost and it will print it in terminal 

app.use(cors({
  origin: ["https://coursifydev.netlify.app", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

// Important: Handle preflight requests
app.options('*', cors());
// cookie parser is udes to get the directly token which is used in isLoggedin method used in auth middleware
// for parsing the token
app.use(cookieParser()) //by using cookie parrser token can be extracted easily that is used in auth.middleware.js
// app.use(exp)
app.use('/ping',function(req,res){
    res.send('/pong')
})

app.use('/api/v1',misllaneousRoutes)
app.use('/api/v1/user',userRoutes);
app.use('/api/v1/course',courseRoute);    
app.use('/api/v1/payments/',paymentsRoute);    

// routes of diffenent module
// any other page which is not present and for that use *
app.all('*',(req,res)=>{
    res.status(404).send('OOPS!!! 404 page not found')
})
// error will be send to user
app.use(errorMiddleware)
export default app

// json web token
// nodemailer