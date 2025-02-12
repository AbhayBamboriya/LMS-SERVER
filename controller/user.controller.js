// import { FSWatcher } from "vite";
import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import cloudinary from 'cloudinary'
import fs from 'fs/promises'
import crypto from 'crypto'
import sendEmail from "../utils/sendEmail.js";
const cookieOptions={
    maxAge:7*24*60*60*1000,//multiply by 1000 for milisecond and it will be present for 7 days\
    httpOnly:true,  //not be accessed thourgh javascript
    secure:true ,
    sameSite:'None'
}
const register  = async(req,res,next)=>{
    // console.log(req.body);
    const {fullName,email,password,role}=req.body;
    // console.log(fullName,email,password);
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
        avatar:{
            public_id:email,
            // secureurl is  environment variable with api key,api secret
            secure_url:'cloudinary://378171611453713:jar_yV68UrVNSKbFbxleqoBxKJQ@dix9kn7zm'
        },role
    })
    // if not user doesnot stored succcessfully 
    if(!user){
        return next(new AppError('User registration is failed please try again',400))
    }

    // these file we will get from bi=ody after the avatar is converted from binary\
    console.log('File deatils-> ',JSON.stringify(req.file));
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
                console.log("URL IMAGE",result.secure_url);
                
                // remove file from local system/server
                fs.rm(`uploads/${req.file.filename}`)

            }
        }catch(e){
            return next(
                new AppError(error || 'File not uploaded,please try again',500)
            )
        }
    }
  
    // TODO: file upload
    await user.save()   // user will be saved
    user.password=undefined
      // ater registration for dirctly login thatswyh used jwt token
      const token=await user.generateJWTToken()
    //   setting thetoken to cookie
      res.cookie('token',token,cookieOptions)
    res.status(201).json({
        success:true,
        message:"User registered successfully",
        user

    })
}

const login=async(req,res,next)=>{
    try{
        const {email,password}=req.body;
        if(!email || !password){
            return next (new AppError('All fields are required',400))
        }
        const user=await User.findOne({email}).select('+password')
        // !user || !user.comparePassword(password)
        if(!(user && (await user.comparePassword(password)))){
            return next(new AppError('Email and Password doesnot match',400))
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
        // const userId=req.body
        console.log(userId);
        const user=await User.findById(userId)
        console.log("user"+user);
        res.status(200).json({
            success:true,
            message:"User Details",
            user
        })
    }
    // onst user = await User.findById(id).select('+password')
    // if(!user){
    //     return next(
    //         new AppError('User does not exist',400)
    //     )

    // }
    catch(e){
        return next(new AppError(e.message,400))
    }

}


// firgot and reset password is not working
const forgotPassword=async(req,res,next)=>{
    const {email}=req.body;
    if(!email){
        return next(new AppError('Email is require',400))
    }
    const user=await User.findOne({email})
    if(!user){
        return next(new AppError('Enter registered email',400))
    } 
      // Generating the reset token via the method we have in user model
    const resetToken=await user.generatePasswordResetToken();
    // saving the token to db
    // saving the current token to DB so that for validation
    await user.save() 
    // console.log("token "+resetToken);
    const resetPasswordUrl=`${process.env.FRONTEND_URL}password/${resetToken}`;
    console.log("reset Token "+resetPasswordUrl);
    const message= 'Mail is send to registered email id' 
    const subject='Reset Password';
    try{ 
        // method that will send the  mail;  ;
        const e=await sendEmail(email,subject,message)
        // console.log("email "+e);
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
const resetPassword=async(req,res,next)=>{
    console.log('reset Password');
    console.log('req from frontend',req);
    console.log("params "+req.params);
    console.log("body "+JSON.stringify(req.body));
    const {resetToken} = req.params;
    const{password}=req.body
    console.log("reset Token "+resetToken);
    if(!password){
        return next(
            new AppError('password not present',400)
        )
    }
    console.log("password "+password);
    const forgotPasswordToken=crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')
    const user = await User.findOne({
        // that token is existing or not
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

const changePassword=async(req,res,next)=>{
    try{
        
    const { password,setPassword}= req.body
    const {id}=req.user
    console.log('id '+id,password,setPassword);
    // console.log("old pass "+oldpassword);
    // console.log('new pass '+newpassword);
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
    const fullName=req.body.fullName
    const id=req.user.id
    // const {id}=req.body
    console.log('fullname '+fullName);
    console.log("id "+id);
    const user=await User.findById(id);
    console.log("user"+user);
    if(!user){
        return next(
            new AppError('User does not exist',400)
        )

    }
    if(fullName){
        user.fullName=fullName
    }
    // update the avatar if avatar is provided 
    if(req.file){
        // destroying the existing image
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

// }
const checkUser=async(req,res,next)=>{
    console.log('req',req.body);
    const {email}=req.body;
    console.log('email',email);
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
export{
    register,
    getProfile,
    checkUser,
    logout,
    updateUser,
    login,
    forgotPassword,
    resetPassword,
    changePassword
}