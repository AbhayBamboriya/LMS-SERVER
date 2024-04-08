// import User from "../models/user.model";
import User from "../models/user.model.js";
import { razorpay } from "../server.js";
import AppError from "../utils/error.util.js";


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
        // creating subscription throw razorpay
        const subscription=await razorpay.subscriptions.create({
            plain_id:process.env.RAZORPAY_PLAIN_ID,
            // notification will be send to customenr to payment
            customer_notify:1
        })  
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
        const user=await User.findById(id)
        if(!user){
            return next(
                new AppError(
                    'Unauthorisied plz login',400
                )
            )
        }

        const subcriptionId=user.subscription.id
        // generating signature and compare to know wheather the payment is successfully happened or not 
        const generatefSignature = crypto
            .createHmac('sha256',process.env.RAZORPAY_SECRET)
            .update(`${razorpay_payment_id}|${subscription_id}`)
            .digest('hex')

        if(generatefSignature !== razorpay_signature){
            return next(
                new AppError('Payment Not verified plz try again',500)
            )
        }

        await Payment.create({
            razorpay_payment_id,
            razorpay_signature,
            razorpay_subscription_id
        })

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
