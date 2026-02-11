const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../config/s3");
const Employee = require("../modules/employees/employee.model");

const uploadToS3 = (folder) => {
    
    return multer({
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB limit
        },
        
        fileFilter: (req, file, cb) => {
            const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
            if (!allowedTypes.includes(file.mimetype)) {
                return cb(new Error("Only PDF, JPG, PNG allowed"));
            }
            
            cb(null, true);
        },
        
        storage: multerS3({
            s3,
            
            bucket: process.env.AWS_S3_BUCKET,
            
            key: async (req, file, cb) => {
                try {
          const employeeId = req.params.id;

          if (!employeeId) {
            return cb(new Error("Employee ID missing in params"));
          }

          // Fetch employee to get companyId
          const employee = await Employee.findById(employeeId);

          if (!employee) {
            return cb(new Error("Employee not found"));
          }

          const companyId = employee.companyId;

          const ext = file.originalname.split(".").pop();
          const timestamp = Date.now();

          const filePath = `companies/${companyId}/employees/${employeeId}/${folder}/${timestamp}.${ext}`;

          cb(null, filePath);

        } catch (err) {
          cb(err);
        }
      }
    })
  });
};

module.exports = uploadToS3;
