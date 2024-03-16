import app from './app.js'
import {config} from 'dotenv'
import connectionToDB from './config/dbConnection.js'
import cloudinary from 'cloudinary'
// config is used because to use.dotenv file by these only it will consider the .env file
config()
// by doing these whatever wriiten in env file will used
const PORT=process.env.PORT||5000

// these will be used in cloudinary where to upload the image
// cloudinary configuration
cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})
app.listen(PORT,async()=>{
    await connectionToDB()
    console.log(`App is runnig at http:localhost:${PORT}`);
})

