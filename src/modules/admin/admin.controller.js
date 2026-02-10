const service = require("./admin.service");


exports.getCompanyDashboardData = async (req, res) => {
  try {
    const companyId = req.companyId;

    const [
      totalEmployees,
      attendance,
      pendingLeaves,
      hiring,
      upcomingEvents
    ] = await Promise.all([
      service.totalActiveEmployees(companyId),
      service.todayAttendanceMetrics(companyId),
      service.pendingLeaveRequests(companyId),
      service.weeklyHiringMetrics(companyId),
      service.upcomingEventsService(companyId)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        presentToday: attendance.presentToday,
        absentToday: attendance.absentToday,
        pendingLeaveRequests: pendingLeaves.length,
        weeklyInterviews: hiring.weeklyInterviews,
        newApplications: hiring.newApplications,
        upcomingEvents,
        leaveRequests: pendingLeaves
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
