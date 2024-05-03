import { Router } from 'express';
import {  authorisedSubscriber, isLoggedIn } from '../middleware/auth.middleware.js';
// import { authorisedSubscriber, isLoggedIn,authorisedRoles } from '../middleware/auth.middleware';
import { allPayments, buySubscription, cancelSubscription, getRazorpayApiKey, verifySubscription } from '../controller/payment.controller.js'
import { authorisedRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.route('/subscribe').post(isLoggedIn, 
  buySubscription
);
router.route('/verify').post(isLoggedIn,
   verifySubscription
  );
router
  .route('/unsubscribe')
  .post(isLoggedIn,
    authorisedSubscriber,
     cancelSubscription
    );
router.route('/razorpay-key').get(isLoggedIn, 
  getRazorpayApiKey
);
router.route('/').get(isLoggedIn, authorisedRoles('ADMIN'), 
  allPayments
);
export default router;