import { Router } from "express";
import { changePassword, forgotPassword, getProfile, login, logout, register, resetPassword, updateUser  } from "../controller/user.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import upload from '../middleware/multer.middleware.js'
const router =Router(); //creating instance

router.post('/register',upload.single("avatar"),register)   //in upload single file orhow many file u have to upload
router.post('/login',login) 
router.get('/logout',logout)
router.get('/me',isLoggedIn,getProfile) //first of all it will go through verifivcation process
//through isloggedin method which is in auth.middleware
router.post('/reset',forgotPassword);
router.post('/password/:resetToken',resetPassword) 
// router.post('/password/:resetToken',(req,res)=>{
//     res.send("helo")
// }) 
router.post('/changePassword',isLoggedIn,changePassword)
router.put('/update',isLoggedIn,upload.single("avatar"),updateUser) 
export default router