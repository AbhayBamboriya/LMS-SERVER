import { Router } from 'express';
import {
  getRazorpayApiKey,
  buySubscription,
  verifySubscription,
  cancelSubscription,
  allPayments,
} from '../controller/payment.controller.js';
import {
  authorisedRoles,
  authorizeSubscribers,
  isLoggedIn,
} from '../middleware/auth.middleware.js';

const router = Router();

router.route('/subscribe').post(isLoggedIn, buySubscription);
router.route('/verify').post(isLoggedIn, verifySubscription);
router
  .route('/unsubscribe')
  .post(isLoggedIn, authorizeSubscribers, cancelSubscription);
router.route('/razorpay-key').get(isLoggedIn, getRazorpayApiKey);
router.route('/:count ').get(isLoggedIn, authorisedRoles('ADMIN'), allPayments);

export default router;