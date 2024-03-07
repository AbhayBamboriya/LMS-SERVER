import { Router } from "express";
import { changePassword, forgotPassword, getProfile, login, logout, register, updateUser  } from "../controller/user.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import upload from '../middleware/multer.middleware.js'
const router =Router();
router.post('/register',upload.single("avatar"),register)   //in upload single file orhow many file u have to upload
router.post('/login',login)
router.get('/logout',logout)
router.get('/me',isLoggedIn,getProfile) //first of all it will go through verifivcation process
//through isloggedin method
// router.post('/reset',forgotPassword)
// router.post('/reset/:resetToken',resetPassword)
router.post('/change-password',isLoggedIn,changePassword)
router.put('/update',isLoggedIn,upload.single("avatar"),updateUser)
export default router