import Course from "../models/course.model.js"
import AppError from "../utils/error.util.js"
import cloudinary from 'cloudinary'
import fs from 'fs/promises'
const getAllCourses=async function(req,res,next){
    // selecting all the things accept lecture
    const course=await Course.find({}).select('-lectures')
    try{
        res.status(200).json({
            success:true,
            message:'All Courses',
            courses
        })
    }
    catch(e){
        return next (
            new AppError(e.message,500)
        )
    }
}

const getLectureByCourseId=async function(req,res,next){
    try{
        const {id}=req.params
        const course=await Course.findById(id);
        if(!course){
            return next (
                new AppError('Invalid courses id',500)
            )
        }
        res.status(200).json({
            success:true,
            message:'Course lectures fetched successfully', 
            lectures:course.lectures
        })
    }
    catch(e){
        return next (
            new AppError(e.message,500)
        )
    }
}

const createCourses=async(req,res,next)=>{
    const {title,description,category,createdBy}=req.body;
    if(!title || !description || !category || !createdBy){
        return next(
            new AppError('All fields are required',400)
        )
    }
    // creating the courses instance
    const courses=await Course.create({ 
        title,
        description,
        category,
        createdBy,
        thumbnail:{
            public_id:'Dummmy',
            secure_url:'Dummy'
        }
    })

    if(!courses){
        return next(
            new AppError('Course could not be created try again',500)
        )
    }

    if(req.file){
        try{
            const result=await cloudinary.v2.uploader.upload(req.file.path,{
                folder:'lms'
            })
            if(result){
                courses.thumbnail.public_id=result.public_id
                courses.thumbnail.secure_url=result.secure_url
            }
    
            fs.rm(`uploads/${req.file.filename}`)
        }
        catch(e){
            return next(
                new AppError(e.message,500)
            )
        }
    }
    await courses.save()    

    res.status(200).json({
        success:true,
        message:"Courses created successfully",
        courses
    })   

}
const updateCourses=async(req,res,next)=>{

}
const removeCourses=async()=>{

}
export{
    getLectureByCourseId,
    getAllCourses,
    createCourses,updateCourses,removeCourses
}