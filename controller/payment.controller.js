// import User from "../models/user.model";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import { razorpay } from "../server.js";
import AppError from "../utils/error.util.js";
import crypto from 'crypto';


// for instaliing razorpay npm i razorpay
export const getRazorpayApiKey = async(req,res,next)=>{
    try{
        res.status(200).json({
            success:true,
            message:"Razorpay API key",
            key:process.env.RAZORPAY_KEY_ID
        })
    }
    
    catch(e){
        return next(
            new AppError(e.message,500)
        )
    }
};
export const buySubscription = async(req,res,next)=>{
    try{
        const {id}=req.user
        const user=await User.findById(id)
        console.log('user is',user);
        
        if(!user){
            return next(
                new AppError('Unauthorised, Please Login')
            )
        }
        if(user.role==='ADMIN'){
            return next(
                new AppError(
                    'Admin cannot purchase a subsription',400
                )
            )
        }
        console.log('reached here');
        
        // creating subscription throw razorpay
        // const subscription=await razorpay.subscriptions.create({
        //     plain_id:process.env.RAZORPAY_PLAIN_ID,
        //     // notification will be send to customenr to payment
        //     customer_notify:1
        // }) 
        // const plans = await razorpay.plans.all();
// console.log('plains',plans);
        console.log('id is',process.env.RAZORPAY_PLAN_ID)
        
        const subscription = await razorpay.subscriptions.create({
             plan_id: process.env.RAZORPAY_PLAN_ID, // The unique plan ID
            // plan_id:'',
            customer_notify: 1, // 1 means razorpay will handle notifying the customer, 0 means we will not notify the customer
            total_count: 12, // 12 means it will charge every month for a 1-year sub.
          }) 
        console.log('subscription is',subscription);
        
        // information is getting stored at user level
        user.subscription.id=subscription.id
        user.subscription.status=subscription.status

        await user.save()
        res.status(200).json({
            success:true,
            message:'You have subscribed successfully',
            subscription_id:subscription.id
        })
    }
    
    catch(e){
        return next(
            new AppError(e.message,500)
        )
    }
}
export const verifySubscription = async(req,res,next)=>{
    try{
        const {id}=req.user
        const {razorpay_payment_id,razorpay_signature,razorpay_subscription_id}=req.body
        console.log('iddddd ',id);
        console.log(razorpay_payment_id);
        console.log(razorpay_signature);
        console.log(razorpay_subscription_id);
        
        const user=await User.findById(id)
        if(!user){
            return next(
                new AppError(
                    'Unauthorisied plz login',400
                )
            )
        }
        console.log('user is ',user.subscription.id);
        
        const subcriptionId=user.subscription.id
        console.log('subscritption id',subcriptionId);
        
        // generating signature and compare to know wheather the payment is successfully happened or not 
        const generatefSignature = crypto
            .createHmac('sha256',process.env.RAZORPAY_SECRET)
            .update(`${razorpay_payment_id}|${subcriptionId}`)
            .digest('hex')
        console.log('siignature ',generatefSignature);
        
        if(generatefSignature !== razorpay_signature){
            return next(
                new AppError('Payment Not verified plz try again',500)
            )
        }
        console.log('reached eithrr');
        
        await Payment.create({
            razorpay_payment_id,
            razorpay_signature,
            razorpay_subscription_id
        })
        console.log('check');
        
        user.subscription.status='active'
        await user.save()

        res.status(200).json({
            success:true,
            message:'Payment verfied Successfully'
        })
    }

    catch(e){
        return next(
            new AppError(e.message,500)
        )
    }
}
export const cancelSubscription = async(req,res,next)=>{
    try{
            const {id}=req.user
            const uaer=await User.findById(id)
            if(!user){
                return next(
                    new AppError('Unauthorised, Please Login')
                )
            }
            if(user.role==='ADMIN'){
                return next(
                    new AppError(
                        'Admin cannot purchase a subsription',400
                    )
                )
            }
            const subscriptionId = user.subscription.id
            const subscription = await razorpay.subscription.cancel(
                subscriptionId
            )

            user.subscription.status=subscription.status

            await user.save()
    }
    catch(e){
        return next(
            new AppError(e.message,500)
        )
    }


}
export const allPayments = async(req,res,next)=>{
    try{
        const {count}=req.query
        const subcription=await razorpay.subcription.all({
            count:count||10 
        })
        res.status(200).json({
            success:true,
            message:'All Payment',
            subcription
        })

    }
    catch(e){
        return next(
            new AppError(e.message,500)
        )
    }

}
