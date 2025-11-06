import {Router} from "express";
import { addLectureByCourseId, createCourses, getAllCourses, getCourseDetails, getLectureByCourseId, removeCourses, removeLectureFromCourse, updateCourses } from "../controller/course.controller.js";
import { authorisedRoles, authorisedSubscriber, isLoggedIn } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";
const router=Router()   //creating the instance


router.route('/')
// it is used when we have to change thee method like get,post
    .get(getAllCourses) 
    .post(
        isLoggedIn,
        authorisedSubscriber,
        authorisedRoles('ADMIN'),
        upload.single('thumbnail'), 
        createCourses)      //working properly
        // .delete(isLoggedIn, authorizeRoles('ADMIN'), removeLectureFromCourse);
router.route('/:id')
    .get(isLoggedIn,getLectureByCourseId)   //working properly
    .put(isLoggedIn, authorisedRoles('ADMIN'),updateCourses)        //working properly
    .delete(isLoggedIn, authorisedRoles('ADMIN'),removeCourses)     //working properly
    .post(isLoggedIn,authorisedRoles('ADMIN'),upload.single('lecture'),addLectureByCourseId) 
router.route('/course/:id').get(isLoggedIn,getCourseDetails)
    //working properly
    // /course/courseId/${data.courseId}/lectureId/${data.lectureId}    
router.route('/:courseId/:lectureId')
    .delete(isLoggedIn,authorisedRoles('ADMIN'), removeLectureFromCourse);

export default router




