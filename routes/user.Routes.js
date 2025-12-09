import { Router } from "express";
import { ActiveSubscription, changePassword, checkUser, forgotPassword, getProfile, login, logout, register, resetPassword, updateUser  } from "../controller/user.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import upload from '../middleware/multer.middleware.js'

const router =Router(); 

router.post('/register',upload.single("avatar"),register)  

router.post('/login',login) 

router.get('/logout',logout)

router.get('/me',isLoggedIn,getProfile)

router.post('/reset',forgotPassword);

router.post('/password/:resetToken',resetPassword) 

router.get('/activeSubscription',isLoggedIn,ActiveSubscription)

router.post('/check',checkUser)

router.post('/changePassword',isLoggedIn,changePassword)

router.put('/update/:id',isLoggedIn,upload.single("avatar"),updateUser) 
export default router