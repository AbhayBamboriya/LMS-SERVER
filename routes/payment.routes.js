import { Router } from 'express';
import {
  getRazorpayApiKey,
  buySubscription,
  verifySubscription,
  cancelSubscription,
  allPayments,
  // createPlan,
} from '../controller/payment.controller.js';
import {
  authorisedRoles,
  authorisedSubscriber,
  isLoggedIn,
} from '../middleware/auth.middleware.js';

const router = Router();

router.route('/subscribe').post(isLoggedIn, buySubscription);

router.route('/verify').post(isLoggedIn, verifySubscription);

router.route('/unsubscribe').post(isLoggedIn , cancelSubscription);

router.route('/razorpay-key').get(isLoggedIn, getRazorpayApiKey);

router.route('/').get(isLoggedIn, authorisedRoles('ADMIN'), allPayments);

export default router;