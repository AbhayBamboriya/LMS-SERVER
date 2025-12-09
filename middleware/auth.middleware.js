import User from "../models/user.model.js";
import AppError from "../utils/error.util.js"
import jwt from 'jsonwebtoken'
const isLoggedIn = async (req,res,next)=>{
    try{
        const {token}=req.cookies
        if(!token){
            return next(new AppError('Unauthenticated , please login again',405))
        }
        const userDetails=await jwt.verify(token,process.env.JWT_SECRET)
        
        if (!userDetails) {

            return next(new AppError("Unauthorized, please login to continue", 401));
        }
        
        req.user=userDetails
        
        next()
    }
    catch (error) {
        console.log(error);
        return next(new AppError(error.message, 400));
    }
}

const authorisedRoles=(...roles)=>async (req,res,next)=>{
    try{
    
        const currentUser=req.user.role
    
        if(!roles.includes(currentUser)){
            return next(
                new AppError('Do not have permission to access these route ',403)
            )
        }
        
        next()
    }
    catch (error) {
        return next(new AppError(error.message, 400));
    }
    }


const authorisedSubscriber = async(req,res,next) =>{
    try{
        
        const user=await User.findById(req.user.id)
        
        if(user.role !== 'ADMIN' && user.subscription.status !== 'active'){
            return next(
                new AppError('Please subscribe to access these route',403)
            )
        }

        next()
    }
    catch (error) {
        console.log(error);
        return next(new AppError(error.message, 400));
    }
}
export{
    isLoggedIn,
    authorisedSubscriber,
    authorisedRoles
}