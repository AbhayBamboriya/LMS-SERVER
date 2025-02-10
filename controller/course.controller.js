import Course from "../models/course.model.js"
import AppError from "../utils/error.util.js"
import cloudinary from 'cloudinary'
import fs from 'fs/promises'
const getAllCourses=async function(req,res,next){
    // selecting all the things accept lecture
    const course=await Course.find({}).select('-lectures')
    // console.log("course "+course);
    try{
        res.status(200).json({
            success:true,
            message:'All Courses',
            course
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
    try{
        const {id}=req.params
        const course=await Course.findByIdAndUpdate(
            // data must be updated to which id
            id,
            {
                // overwriting the contnt
                $set:req.body
            },
            {
                // it is used to check the new data is correct or not
                runValidators:true
            }

        )
        if(!course){
            return next(
                new AppError('Courses with given id does not exist',500)
            )
        }
        res.status(200).json({
            success:true,
            message:'Course updated successfully',
            course
        })

        
    }
    catch(e){
        return next(
            new AppError(e.message,500)
        )
    }
}
const removeCourses=async(req,res,next)=>{
    try{
        const{id}=req.params
        const course=await Course.findById(id);
        if(!course){
            return next(
                new AppError('Coursses with givenid is not present',500)
            )
        }
        await Course.findByIdAndDelete(id);
        res.status(200).json({
            success:true,
            message:'Course deleted successsfully'
        })

    }
    catch(e){
        return next(
            new AppError(e.message,500)
        )
    }
}

export const removeLectureFromCourse =async (req, res, next) => {
    // Grabbing the courseId and lectureId from req.query
    console.log('req',req.params);
    
    const { courseId, lectureId } = req.params;
    console.log('removing lecture',req);
    
    console.log("id is ",courseId,lectureId);
  
    // Checking if both courseId and lectureId are present
    if (!courseId) {
      return next(new AppError('Course ID is required', 400));
    }
  
    if (!lectureId) {
      return next(new AppError('Lecture ID is required', 400));
    }
  
    // Find the course uding the courseId
    const course = await Course.findById(courseId);
  
    // If no course send custom message
    if (!course) {
      return next(new AppError('Invalid ID or Course does not exist.', 404));
    }
  
    // Find the index of the lecture using the lectureId
    const lectureIndex = course.lectures.findIndex(
      (lecture) => lecture._id.toString() === lectureId.toString()
    );
  
    // If returned index is -1 then send error as mentioned below
    if (lectureIndex === -1) {
      return next(new AppError('Lecture does not exist.', 404));
    }
  
    // Delete the lecture from cloudinary
    await cloudinary.v2.uploader.destroy(
      course.lectures[lectureIndex].lecture.public_id,
      {
        resource_type: 'video',
      }
    );
  
    // Remove the lecture from the array
    course.lectures.splice(lectureIndex, 1);
  
    // update the number of lectures based on lectres array length
    course.numberOfLectures = course.lectures.length;
  
    // Save the course object
    await course.save();
  
    // Return response
    res.status(200).json({
      success: true,
      message: 'Course lecture removed successfully',
    });
  };
  
const addLectureByCourseId=async(req,res,next)=>{
   try{
    const {title ,description}=req.body
    const {id}=req.params;
    console.log("idddd "+id,req.file);
    if(!title || !description){
        return next(
            new AppError('All fields are required',400)
        )
    }
    const course=await Course.findById(id)
    if(!course){
        return next(
            new AppError('Coursses with given id is not present',500)
        )
    }
    const lectureData={
        title,
        description,
        lecture:{}
    }
    
    if(req.file){
        try{
            const result=await cloudinary.v2.uploader.upload(req.file.path,{
                folder:'lms',
                resource_type: 'video', 
            })
            console.log('result is ',result);
            
            if(result){
                lectureData.lecture.public_id=result.public_id 
                console.log('result secure',result.secure_url);
                lectureData.lecture.secure_url=result.secure_url
            }
    
            fs.rm(`uploads/${req.file.filename}`)
        }
        catch(e){
            return next(
                new AppError(e.message,500)
            )
        }
    }
        // pushing into the data base
        console.log('lexture---------- '+JSON.stringify(lectureData));
    course.lectures.push(lectureData)

    // updating the no of ;ectures
    course.numberOfLecture=course.lectures.length
    await course.save()
    res.status(200).json({
        success:true,
        message:'lecture added successfully to course',
        course
    })
   }
   catch(e){
        return next(
            new AppError(e.message,500)
        ) 
    }

}
export{
    getLectureByCourseId,
    getAllCourses,
    createCourses,updateCourses,removeCourses,addLectureByCourseId
}
