import {Router} from "express";
import { addLectureByCourseId, createCourses, getAllCourses, getCourseDetails, getLectureByCourseId, removeCourses, removeLectureFromCourse, updateCourses } from "../controller/course.controller.js";
import { authorisedRoles, authorisedSubscriber, isLoggedIn } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";
const router=Router()  


router.route('/')
    .get(getAllCourses) 
    .post(
        isLoggedIn,
        authorisedSubscriber,
        authorisedRoles('ADMIN'),
        upload.single('thumbnail'), 
        createCourses)   

router.route('/:id')
    .get(isLoggedIn,getLectureByCourseId)   
    .put(isLoggedIn, authorisedRoles('ADMIN'),updateCourses)       
    .delete(isLoggedIn, authorisedRoles('ADMIN'),removeCourses)   
    .post(isLoggedIn,authorisedRoles('ADMIN'),upload.single('lecture'),addLectureByCourseId) 


router.route('/course/:id').get(isLoggedIn,getCourseDetails)


router.route('/:courseId/:lectureId')
    .delete(isLoggedIn,authorisedRoles('ADMIN'), removeLectureFromCourse);

export default router




