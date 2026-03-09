const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../config/s3");

const uploadToS3 = (folder) => {
  return multer({
    storage: multerS3({
      s3,
      bucket: process.env.AWS_S3_BUCKET,
      key: (req, file, cb) => {
        const companyId =
          req.companyId || req.params.companyId || req.user?.companyId;

        if (!companyId) {
          return cb(new Error("Company ID missing"));
        }

        const ext = file.originalname.split(".").pop();
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e6);

        cb(
          null,
          `companies/${companyId}/${folder}/${uniqueSuffix}.${ext}`
        );
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only JPEG, PNG, WEBP and PDF files are allowed"));
      }
    },
  });
};

module.exports = uploadToS3;
