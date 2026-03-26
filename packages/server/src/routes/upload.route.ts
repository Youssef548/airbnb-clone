import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import { isAuth } from "../middleware/auth.middleware";

const UPLOAD_DIR = path.resolve(__dirname, "../../uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const router = Router();

router.post(
  "/",
  isAuth,
  (req: Request, res: Response, next: NextFunction) => {
    upload.single("image")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res
            .status(413)
            .json({ message: "File size exceeds 5MB limit" });
        }
        return res.status(400).json({ message: err.message });
      }
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }
    const url = `/uploads/${req.file.filename}`;
    return res.status(200).json({ url });
  }
);

export default router;
