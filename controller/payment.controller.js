
import crypto from 'crypto';
import asyncHandler from '../middleware/asyncHandler,middleware.js';
import AppError from '../utils/error.util.js';
import User from '../models/user.model.js';
import { razorpay } from '../server.js';
import Payment from "../models/payment.model.js";
import SubscriptionPlanModel from '../models/SubscriptionPlanModel.js';

/**
 * @ACTIVATE_SUBSCRIPTION
 * @ROUTE @POST {{URL}}/api/v1/payments/subscribe
 * @ACCESS Private (Logged in user only)
 * 
 * 
 */




export const buySubscription = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.user;
    const { planId ,courseId} = req.body;
  
    const user = await User.findById(id);

    if (!user) return next(new AppError("Unauthorized, please login", 401));
    if (user.role === "ADMIN")   return next(new AppError("Admin cannot purchase a subscription", 400));
    let subscription;
    try {
      subscription = await razorpay.subscriptions.create({
        plan_id: planId ,
        customer_notify: 1,
        total_count: 12,
      });
    } 
    catch (err) {
       return next(new AppError(e.message, 500));
    }


    

    user.activeSubscriptions.push({
        subscriptionId: subscription.id,
        courseId: courseId,
        status: subscription.status,
        start: null,
        end: null
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Subscribed successfully",
      subscription_id: subscription.id,
    });
  } catch (e) {
    return next(new AppError(e.message, 500));
  }
});


/**
 * @VERIFY_SUBSCRIPTION
 * @ROUTE @POST {{URL}}/api/v1/payments/verify
 * @ACCESS Private (Logged in user only)
 */
export const verifySubscription = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.user;
    const { razorpay_payment_id, courseId, razorpay_subscription_id, razorpay_signature } = req.body;

    // Validate input
    if (!razorpay_payment_id || !razorpay_signature|| !razorpay_subscription_id || !courseId) {
      return next(new AppError("Missing required payment fields.", 400));
    }

    // Fetch user
    const user = await User.findById(id);

    if (!user) {
      return next(new AppError("User not found.", 404));
    }

    if (!user.activeSubscriptions || user.activeSubscriptions.length === 0) {
      return next(new AppError("User has no subscription ID.", 400));
    }
    
    const subscription =  user.activeSubscriptions.find(
                                    (sub) => sub.courseId === courseId
                            );
    
    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest("hex");
    
    if (generatedSignature !== razorpay_signature) {
      return next(new AppError("Payment verification failed.", 400));
    }    

    // Prevent duplicate verification
    const existingPayment = await Payment.findOne({ razorpay_payment_id });
    if (existingPayment) {
      return next(new AppError("Payment already verified.", 400));
    }
    
    const subscription_id=subscription.subscriptionId
    
    // Store payment
    await Payment.create({
      subscription_id,
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    });

    
    if(subscription){      
      subscription.status = "active";
      subscription.start = Date.now();
      subscription.end = Date.now() + 30 * 24 * 60 * 60 * 1000;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });

  } catch (e) {
    return next(new AppError(e.message, 500));
  }
});


/**
 * @CANCEL_SUBSCRIPTION
 * @ROUTE @POST {{URL}}/api/v1/payments/unsubscribe
 * @ACCESS Private (Logged in user only)
 */
export const cancelSubscription = asyncHandler(async (req, res, next) => {
  try{
        const { id } = req.user;
        const { subscriptionId }=req.body;
        const user = await User.findById(id);
        
        if (user.role === 'ADMIN') {
          return next(
            new AppError('Admin does not need to cannot cancel subscription', 400)
          );
        }


        if (!user.activeSubscriptions || user.activeSubscriptions.length === 0) {

            return next(new AppError("User has no subscription ID.", 400));
          }
          
          const subscription_user =  user.activeSubscriptions.find(
                                          (sub) => sub.subscriptionId === subscriptionId
                                  );

          if(subscription_user.status==='cancelled'){
            return next(new AppError('You are already not a part of these course',400));
          }
                                  
        try {
              const subscription = await razorpay.subscriptions.cancel(subscriptionId );

              if(subscription_user){
                   subscription_user.status = subscription.status;
              }
             
              await user.save();
        } catch (error) {
            return next(new AppError(error.error.description, error.statusCode));
        }

        // Finding the payment using the subscription ID
        const payment = await Payment.findOne({
          subscription_id: subscriptionId,
        });
        if (!payment) {
          return next(new AppError('Payment not Found',400));
        }

        

        // Getting the time from the date of successful payment (in milliseconds)
        const timeSinceSubscribed = Date.now() - subscription_user.start;

        // refund period which in our case is 14 days
        const refundPeriod = 14 * 24 * 60 * 60 * 1000;
          
        // Check if refund period has expired or not
        if (refundPeriod <= timeSinceSubscribed) {
          return next(
            new AppError(
              'Refund period is over, so there will not be any refunds provided.',
              400
            )
          );
        }
        
        // If refund period is valid then refund the full amount that the user has paid
        await razorpay.payments.refund(payment.razorpay_payment_id, {
          speed: 'optimum', // This is required
        });
        console.log('ch8');
        await User.updateOne(
        { _id: id },
        { $pull: { activeSubscriptions: { subscriptionId: subscriptionId } } }
      );
        
      await user.save();
      await payment.deleteOne();   
        res.status(200).json({
          success: true,
          message: 'Subscription cancelled successfully',
        });
      }
    catch (error) {
      return next(new AppError(error.message, 400));
    }
});

/**
 * @GET_RAZORPAY_ID
 * @ROUTE @POST {{URL}}/api/v1/payments/razorpay-key
 * @ACCESS Public
 */
export const getRazorpayApiKey = asyncHandler(async (_req, res, _next) => {
  try{
      res.status(200).json({
        success: true,
        message: 'Razorpay API key',
        key: process.env.RAZORPAY_KEY_ID,
      });
  }
  catch (error) {
      console.log(error);
      return next(new AppError(error.message, 400));
  }
});

/**
 * @GET_RAZORPAY_ID
 * @ROUTE @GET {{URL}}/api/v1/payments
 * @ACCESS Private (ADMIN only)
 */
export const allPayments = asyncHandler(async (req, res, _next) => {
  try{
  const { count, skip } = req.params;

  // Find all subscriptions from razorpay
  const allPayments = await razorpay.subscriptions.all({
    count: count ? count : 10, // If count is sent then use that else default to 10
    skip: skip ? skip : 0, // // If skip is sent then use that else default to 0
  });

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const finalMonths = {
    January: 0,
    February: 0,
    March: 0,
    April: 0,
    May: 0,
    June: 0,
    July: 0,
    August: 0,
    September: 0,
    October: 0,
    November: 0,
    December: 0,
  };

  const monthlyWisePayments = allPayments.items.map((payment) => {
    // We are using payment.start_at which is in unix time, so we are converting it to Human readable format using Date()
    const monthsInNumbers = new Date(payment.start_at * 1000);

    return monthNames[monthsInNumbers.getMonth()];
  });

  monthlyWisePayments.map((month) => {
    Object.keys(finalMonths).forEach((objMonth) => {
      if (month === objMonth) {
        finalMonths[month] += 1;
      }
    });
  });

  const monthlySalesRecord = [];

  Object.keys(finalMonths).forEach((monthName) => {
    monthlySalesRecord.push(finalMonths[monthName]);
  });

  res.status(200).json({
    success: true,
    message: 'All payments',
    allPayments,
    finalMonths,
    monthlySalesRecord,
  });
}
catch (error) {
    console.log(error);
    return next(new AppError(error.message, 400));
  }
});

export const createOrder = async (req, res) => {
  try {
    const { amount, courseId, userId } = req.body;

    if (!amount || !courseId || !userId) {
      return res.status(400).json({ success: false, message: "Missing details" });
    }

    const order = await razorpay.orders.create({
      amount: amount ,
      currency: "INR",
      receipt: `order_rcpt_${Date.now()}`,
      notes: {
        courseId,
        userId
      }
    });

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: amount * 100,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Order creation failed",
      error: err.message
    });
  }
};