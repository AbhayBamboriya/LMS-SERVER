// import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import User from '../models/user.model.js';
import AppError from '../utils/error.util.js';
import sendEmail, { mail } from '../utils/sendEmail.js';

/**
//  * @CONTACT_US
//  * @ROUTE @POST {{URL}}/api/v1/contact
//  * @ACCESS Public
//  */
export const ResetPasswordEmil =  (async (req, res, next) => {
 try{
    const { name, email, message } = req.body;

    // Checking if values are valid
    if (!name || !email || !message) {
      return next(new AppError('Name, Email, Message are required'));
    }

    
      const subject = 'Contact Us Form';
      const textMessage = `${name} - ${email} <br /> ${message}`;
      console.log('sub',subject);
      console.log('mess',textMessage);
      // Await the send email
      await sendEmail(process.env.CONTACT_US_EMAIL, subject, textMessage);
  

    res.status(200).json({
      success: true,
      message: 'Your request has been submitted successfully',
    });
  }
  catch(e){
          return next(
              new AppError(e.message,500)
          )
      }
});


export const contactUs =  (async (req, res, next) => {
  try {
  const { name, email, message } = req.body;

  // Checking if values are valid
  if (!name || !email || !message) {
    return next(new AppError('Name, Email, Message are required'));
  }


    const subject = 'Contact Us Form';
    const textMessage = `${name} - ${email} <br /> ${message}`;
    console.log('sub',subject);
    console.log('mess',textMessage);
    // Await the send email
    await mail(process.env.CONTACT_US_EMAIL, subject, textMessage);
  

  res.status(200).json({
    success: true,
    message: 'Your request has been submitted successfully',
  });
}
   catch (error) {
    console.log(error);
    return next(new AppError(error.message, 400));
  }
});

/**
 * @USER_STATS_ADMIN
 * @ROUTE @GET {{URL}}/api/v1/admin/stats/users
 * @ACCESS Private(ADMIN ONLY)
 */
export const userStats = (async (req, res, next) => {
  try{
      const allUsersCount = await User.countDocuments();

      const subscribedUsersCount = await User.countDocuments({
        'subscription.status': 'active', // subscription.status means we are going inside an object and we have to put this in quotes
      });

      res.status(200).json({
        success: true,
        message: 'All registered users count',
        allUsersCount,
        subscribedUsersCount,
      });
    }
    catch (error) {
    console.log(error);
    return next(new AppError(error.message, 400));
  }
    
});