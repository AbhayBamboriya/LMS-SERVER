import AppError from "../utils/error.util.js"
import jwt from 'jsonwebtoken'
const isLoggedIn = async (req,res,next)=>{
    const {token}=req.cookies
    if(!token){
        return next(new AppError('Unauthenticated , please login again',405))
    }
    const userDetails=await jwt.verify(token,process.env.JWT_SECRET)
    req.user=userDetails
    next()
}

// roles is passed as list in roles
const authorisedRoles=(...roles)=>async (req,res,next)=>{
    const currentUserRole=req.user.role
    if(!roles.includes(currentUserRole)){
        return next(
            new AppError('Do not havve permission to access these route ',403)
        )
    }
    next()
}

export{
    isLoggedIn,
    authorisedRoles
}