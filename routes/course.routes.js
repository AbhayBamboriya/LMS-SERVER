import {Router} from "express";
import { createCourses, getAllCourses, getLectureByCourseId, removeCourses, updateCourses } from "../controller/course.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";
const router=Router()   //creating the instance


router.route('/')
// it is used when we have to change thee method like get,post
    .get(getAllCourses)
    .post(
        upload.single('thumbnail'), 
        createCourses)
router.route('/:id')
    .get(isLoggedIn,getLectureByCourseId)
    .put(updateCourses)
    .delete(removeCourses)


export default router