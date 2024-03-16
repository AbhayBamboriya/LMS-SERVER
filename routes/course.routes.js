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
        authorisedRoles('ADMIN'),
        upload.single('thumbnail'), 
        createCourses)
router.route('/:id')
    .get(isLoggedIn,getLectureByCourseId)
    .put(isLoggedIn, authorisedRoles('ADMIN'),updateCourses)
    .delete(isLoggedIn, authorisedRoles('ADMIN'),removeCourses)
    .post(isLoggedIn,authorisedRoles('ADMIN'),upload.single('lecture'), addLectureByCourseId)


export default router
