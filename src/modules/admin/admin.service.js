const Attendance = require('./models/attendance.odel.js');
const { getTodayRange, getWeekRange } = require("../../utils/date");
const Event = require('./models/event.model.js');
const { getNextNDaysRange } = require('../../utils/date');
const Employee = require('../employees/employee.model.js');
const LeaveRequest = require('./models/leaveRequest.model.js');
const Interview = require('./models/interview.model.js');
const Application = require('./models/application.model.js');


exports.totalActiveEmployees = async (companyId) => {
  return Employee.countDocuments({
    companyId,
    status: 'active'
  });
};


exports.todayAttendanceMetrics = async (companyId) => {
  const { today, tomorrow } = getTodayRange();

  const [presentToday, absentToday] = await Promise.all([
    Attendance.countDocuments({
      companyId,
      date: { $gte: today, $lt: tomorrow },
      status: 'present'
    }),
    Attendance.countDocuments({
      companyId,
      date: { $gte: today, $lt: tomorrow },
      status: 'absent'
    })
  ]);

  return { presentToday, absentToday };
};



exports.pendingLeaveRequests = async (companyId) => {
  return LeaveRequest.find({
    companyId,
    status: 'Pending'
  })
    .select(
      '_id employeeId employeeName leaveType startDate endDate reason status createdAt'
    )
    .sort({ createdAt: -1 })
    .lean();
};



exports.weeklyHiringMetrics = async (companyId) => {
  const { start, end } = getWeekRange();

  const [weeklyInterviews, newApplications] = await Promise.all([
    Interview.countDocuments({
      companyId,
      status: 'scheduled',
      scheduledDate: { $gte: start, $lt: end }
    }),
    Application.countDocuments({
      companyId,
      status: 'new',
      appliedDate: { $gte: start, $lt: end }
    })
  ]);

  return { weeklyInterviews, newApplications };
};


exports.upcomingEventsService = async (companyId) => {
  const { start, end } = getNextNDaysRange(30);

  return Event.find({
    companyId,
    eventDate: { $gte: start, $lte: end },
    status: { $ne: 'Cancelled' },
    isActive: true
  })
    .sort({ eventDate: 1 })
    .limit(10)
    .lean();
};
