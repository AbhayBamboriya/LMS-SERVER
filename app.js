import express from 'express'
import userRoutes from './routes/user.Routes.js'
import cors from 'cors'
import cookieParser  from 'cookie-parser'
import morgan from 'morgan';
import courseRoute from './routes/course.routes.js'
import errorMiddleware from './middleware/error.middleware.js';
const app=express()
// for parsing to json data directly
app.use(express.json());
app.use(express.urlencoded({extended:true}))        //it will extract out the query params from url
app.use(morgan('dev'))
app.use(cors({
    // frntend ka url will be different thatswhy by using cors we can interact with frontend page
    origin:[process.env.FRONTEND_URL],
    // credential used because cookie can be navigate from from different localhost
    credentials:true
}));
// cookie parser is udes to get the directly token which is used in isLoggedin method used in auth middleware
app.use(cookieParser())
// app.use(exp)
app.use('/ping',function(req,res){
    res.send('/pong')
})
app.use('/api/v1/user',userRoutes);
app.use('/api/v1/course',courseRoute);    
// routes of diffenent module
// any other page which is not present and for that use *
app.all('*',(req,res)=>{
    res.status(404).send('OOPS!!! 404 page not found')
})
// error will be send to user
app.use(errorMiddleware)
export default app