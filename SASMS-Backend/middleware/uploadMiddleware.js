import fs from "fs";
import path from "path";
import multer from "multer";

const ensureDirectory = (folder) => {
  const absolutePath = path.resolve(folder);
  fs.mkdirSync(absolutePath, { recursive: true });
  return absolutePath;
};

const sanitizeFilename = (filename = "file") =>
  filename.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");

const createDiskStorage = (folder) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, ensureDirectory(folder));
    },
    filename: function (req, file, cb) {
      const uniqueName = `${Date.now()}-${sanitizeFilename(file.originalname)}`;
      cb(null, uniqueName);
    },
  });

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype?.startsWith("image/")) {
    cb(null, true);
    return;
  }
  cb(new Error("Only image files are allowed"));
};

export const createUploader = (folder) =>
  multer({
    storage: createDiskStorage(folder),
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  });

const upload = createUploader("uploads/services");

export default upload;
