import {Router} from "express";
import { addLectureByCourseId, createCourses, getAllCourses, getLectureByCourseId, removeCourses, updateCourses } from "../controller/course.controller.js";
import { authorisedRoles, isLoggedIn } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";
const router=Router()   //creating the instance


router.route('/')
// it is used when we have to change thee method like get,post
    .get(getAllCourses) 
    .post(
        isLoggedIn,
        authorisedRoles("ADMIN"),
        upload.single('thumbnail'), 
        createCourses)      //working properly
router.route('/:id')
    .get(isLoggedIn,getLectureByCourseId)   //working properly
    .put(isLoggedIn, authorisedRoles('ADMIN'),updateCourses)        //working properly
    .delete(isLoggedIn, authorisedRoles('ADMIN'),removeCourses)     //working properly
    .post(isLoggedIn,authorisedRoles('ADMIN'),upload.single('lecture'),addLectureByCourseId)        //working properly


export default router
