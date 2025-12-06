const errorMiddleware=(err,req,res,next)=>{
    try{
    err.statusCode=err.statusCode || 500
    err.message=err.message || "Something went wrong"
    return res.status(err.statusCode).json({
        success:false,
        message:err.message,
        stack:err.stack
    })
}
catch (error) {
    console.log(error);
    return next(new AppError(error.message, 400));
  }
}
export default errorMiddleware 