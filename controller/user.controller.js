// import { FSWatcher } from "vite";
import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import cloudinary from 'cloudinary'
import fs from 'fs/promises'
import crypto from 'crypto'
import sendEmail from "../utils/sendEmail.js";
import { log } from "console";
const cookieOptions={
    maxAge:7*24*60*60*1000,//multiply by 1000 for milisecond and it will be present for 7 days\
    httpOnly:true,  //not be accessed thourgh javascript
    secure:true ,
    sameSite:'None'
}
const register  = async(req,res,next)=>{
    try{
            const {fullName,email,password,role}=req.body;
            console.log('details',fullName,email,password);
            if(!fullName || !email || !password ||!role){
                return next(new AppError('All fields are Required',400))
            }
            const userExists = await User.findOne({email})
            if(userExists){
                return next(new AppError('Email already exist',400))
            }

            const user =await User.create({
                fullName,
                email,
                password,
                role,
                avatar:{
                    public_id:email,
                    secure_url:'cloudinary://378171611453713:jar_yV68UrVNSKbFbxleqoBxKJQ@dix9kn7zm'
                }
            })
            if(!user){
                return next(new AppError('User registration is failed please try again',400))
            }

            if(req.file){
            
                try{
                    const result=await cloudinary.v2.uploader.upload(req.file.path,{
                        // at which folder you have to upload the image
                        folder:'lms',
                        width:250,
                        height:250,
                        // gravity is used to auto focus
                        gravity:'faces',
                        crop:'fill'
                    })
                    // try
                    if(result){
                        user.avatar.public_id=result.public_id
                        user.avatar.secure_url=result.secure_url    
                        // remove file from local system/server
                        fs.rm(`uploads/${req.file.filename}`)

                    }
                }catch(e){
                    return next(
                        new AppError(error || 'File not uploaded,please try again',500)
                    )
                }
            }
        
            await user.save()   
            user.password=undefined

            const token=await user.generateJWTToken()

            res.cookie('token',token,cookieOptions)
            res.status(201).json({
                success:true,
                message:"User registered successfully",
                user

            })
        }
        catch (error) {
            console.log(error);
            return next(new AppError(error.message, 400));
        }
}

const login=async(req,res,next)=>{
    try{
        const {email,password}=req.body;
        if(!email || !password){
            return next (new AppError('All fields are required',400))
        }
        
        const user=await User.findOne({email}).select('+password')
        
        if(!(user && (await user.comparePassword(password)))){
            return next(new AppError('Email and Password does not match',400))
        }
        const token=await user.generateJWTToken()
        user.password=undefined
        res.cookie('token',token,cookieOptions)
        res.status(200).json({
            success:true,
            message:"User loged in successfully",
            user
        })
    }
    catch(e){
        return next(new AppError(e.message,500))
    }
    
}
const logout=(req,res)=>{
    res.cookie('token',null,{
        secure:true,
        maxAge:0,
        httpOnly:true
    })
    res.status(200).json({
        success:true,
        message:"User Logged out successfully"
    })
}
 
const getProfile=async(req,res,next)=>{
    console.log("user"+req.user);
    try{
        const userId = req.user.id
        const user=await User.findById(userId)
        res.status(200).json({
            success:true,
            message:"User Details",
            user
        })
    }
  
    catch(e){
        return next(new AppError(e.message,400))
    }

}


const forgotPassword=async(req,res,next)=>{
    try{
    const {email}=req.body;
    
    if(!email){
        return next(new AppError('Email is require',400))
    }
    const user=await User.findOne({email})
    if(!user){
        return next(new AppError('Enter registered email only',400))
    } 
    
      // Generating the reset token via the method we have in user model
    const resetToken=await user.generatePasswordResetToken();
    // saving the token to db
    // saving the current token to DB so that for validation
    
    await user.save() 

    const resetPasswordUrl=`${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;
    const message= 'To reset your password click on the link given' 
    const subject='Reset Password URL of Coursify ';
    try{ 
        // method that will send the  mail;  ;
        const e=await sendEmail(email,subject,message,resetPasswordUrl)

        res.status(200).json({
            success:true,
            message:`Reset Password token has been send to ${email} successfully`,
            resetToken
        })
    }
    catch(e){
        
        user.forgotPasswordExpiry=undefined
        user.forgotPasswordToken=undefined
        await user.save()
        return next(new AppError(toString(e).message,500)) 
    }
}
catch (error) {
    return next(new AppError(error.message, 400));
  }
}
import jwt from "jsonwebtoken";

function isTokenExpired(token) {
  try {
    jwt.verify(token, process.env.JWT_SECRET); 
    return false; // token is valid (NOT EXPIRED)
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return true; // token is EXPIRED
    }
    return true; // other error = treat as expired
  }
}
const resetPassword=async(req,res,next)=>{
    try{
   
            const {resetToken} = req.params;
            const{password}=req.body
        
            if(!password){
                return next(
                    new AppError('password not present',400)
                )
            }
            const forgotPasswordToken=crypto
                .createHash('sha256')
                .update(resetToken)
                .digest('hex')
            const user = await User.findOne({
                // that token is exiting or not
                forgotPasswordToken,
                forgotPasswordExpiry:{$gt: Date.now()}
            })
            if(!user){
                return next(
                    new AppError('Token is invalid please try again',400)
                )
            }

            user.password=password;
            user.forgotPasswordExpiry=undefined
            user.forgotPasswordToken=undefined
            user.save();
            res.status(200).json({
                success:true,
                message:'Password changed success'
            })
    }
    catch (error) {
        return next(new AppError(error.message, 400));
    }
}

const ActiveSubscription=async(req,res,next)=>{
    try{
        const {id}=req.user
        const user = await User.findById(id)
        const active=user.activeSubscriptions
        res.status(200).json({
            success:true,
            message:'Active Subscription sent successfully',
            active
        })
    }
    catch(e){
        return next(new AppError(e.message,500)) 
    }

}

const changePassword=async(req,res,next)=>{
    try{
        
    const { password,setPassword}= req.body
    const {id}=req.user
    if(!password || !setPassword){
        return next(
            new AppError('All filds are mandatory',400)
        )
    }

    const user = await User.findById(id).select('+password')
    if(!user){
        return next(
            new AppError('User does not exist',400)
        )

    }
    const isPasswordValid=await user.comparePassword(password)
    if(!isPasswordValid){
        return next(
            new AppError('Invalid old password',400)
        )

    }
    user.password=setPassword
    await user.save()   //to save the changes in db
    user.password=undefined
    res.status(200).json({
        success:true,
        message:'Password changed successfully'
    })
    }
    catch(e){
        return next(new AppError(e.message,500)) 
    }

}

const updateUser=async(req,res,next)=>{
    try{
    const fullName=req.body.fullName
    const id=req.user.id
    
    const user=await User.findById(id);
    if(!user){
        return next(
            new AppError('User does not exist',400)
        )

    }
    if(fullName){
        user.fullName=fullName
    }
    if(req.file){
        await cloudinary.v2.uploader.destroy(user.avatar.public_id)
            try{
                const result=await cloudinary.v2.uploader.upload(req.file.path,{
                    // at which folder you have to upload the image
                    folder:'lms',
                    width:250,
                    height:250,
                    // gravity is used to auto focus
                    gravity:'faces',
                    crop:'fill'
                })
                if(result){
                    user.avatar.public_id=result.public_id
                    user.avatar.secure_url=result.secure_url    
                    console.log("url"+result.secure_url );
                    // remove file from local system/server
                    fs.rm(`uploads/${req.file.filename}`)
    
                }
            }catch(e){
                return next(
                    new AppError(error || 'File not uploaded,please try again',500)
                )
            }
        
    }

    await user.save()
    res.status(200).json({
        // user,
        success:true,
        message:"Changes are uploaded successfully"
    })
}
catch (error) {
    console.log(error);
    return next(new AppError(error.message, 400));
  }
}


const checkUser=async(req,res,next)=>{
    try{
        const {email}=req.body;
        if(!email){
            return next(new AppError('Email is required',400))
        }
        const user=await User.findOne({email})
        if(!user){
            return next(new AppError('Enter registered email',400))
        } 
        res.status(200).json({
            success:true,
            message:'User Found'
        })
    }
    catch (error) {
        console.log(error);
        return next(new AppError(error.message, 400));
      }


}
export{
    register,
    getProfile,
    checkUser,
    logout,
    updateUser,
    login,
    forgotPassword,
    ActiveSubscription,
    resetPassword,
    changePassword
}