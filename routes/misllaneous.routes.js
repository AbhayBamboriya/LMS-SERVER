import { Router } from 'express';
import {
  contactUs,
  userStats,
} from '../controller/misllaneous.controller.js';
import { authorisedRoles, isLoggedIn } from '../middleware/auth.middleware.js';

const router = Router();

router.route('/contact').post(contactUs);
router
  .route('/admin/stats/users')
  .get(isLoggedIn, authorisedRoles("ADMIN"), userStats);

export default router;