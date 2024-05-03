import path from "path";

import multer from "multer";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 mb in size max limit
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (_req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
  fileFilter: (_req, file, cb) => {
    let ext = path.extname(file.originalname);
    console.log("extension",ext);
    if (
      ext != ".mp4" &&
      ext != ".jpg" &&
      ext != ".jpeg" &&
      ext != ".webp" &&
      ext != ".png" &&
      ext !=".pdf"
      
    ) {
      cb(new Error(`Unsupported file type! ${ext}`), false);
      return;
    }

    cb(null, true);
    console.log('check');
  },
});

export default upload;