// routes/subscriptionRoutes.js
import express from "express";
// import SubscriptionPlan from "../models/SubscriptionPlan.js";
// import AppError from "../utils/AppError.js";
import SubscriptionPlanModel from "../models/SubscriptionPlanModel.js";
import AppError from "../utils/error.util.js";

const router = express.Router();

// @desc   Get subscription plans by course ID
// @route  GET /api/subscription-plans/course/:courseId
// @access Public (or Private if you want auth)
router.get(
  "/plan/:courseId",
  async (req, res, next) => {
    const { courseId } = req.params;
    console.log('reached here',courseId);
    
    const plans = await SubscriptionPlanModel.find({ courseId });

    if (!plans || plans.length === 0) {
      return next(new AppError("No subscription plan found for this course", 404));
    }
    const formattedPlans = plans.map(plan => ({
    planId: plan._id,
    razorpayPlanId: plan.razorpay_plan_id,
    name: plan.name,
    price: plan.price,
    duration: plan.duration
  }));
  console.log('sdkdsdkdjsd',formattedPlans[0]);
  const id= formattedPlans[0].razorpayPlanId;
  console.log(id);
  
    res.status(200).json({
      success: true,
      id
    });
  })
;

export default router;
