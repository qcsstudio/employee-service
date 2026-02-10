const Attendance = require('./models/attendance.odel.js');
const { getTodayRange, getWeekRange } = require("../../utils/date");
const Event = require('./models/event.model.js');
const { getNextNDaysRange } = require('../../utils/date');
const Employee = require('../employees/employee.model.js');
const LeaveRequest = require('./models/leaveRequest.model.js');
const Interview = require('./models/interview.model.js');
const Application = require('./models/application.model.js');
const connectDB = require("../../config/database");
require("../../config/env");
const mongoose = require("mongoose")

async function seedDatabase() {
    try {
        await connectDB();
        
        const companyId = new mongoose.Types.ObjectId("6989c695d94fbcdd27885530");
        
        // Clear existing data for this company only
        await Employee.deleteMany({ companyId });
        await Attendance.deleteMany({ companyId });
        await Interview.deleteMany({ companyId });
        await Application.deleteMany({ companyId });
        await LeaveRequest.deleteMany({ companyId });
        await Event.deleteMany({ companyId });

        console.log('✅ Cleared existing data');

        // ==========================================
        // INSERT EMPLOYEES
        // ==========================================
        const employees = [];
        for (let i = 1; i <= 257; i++) {
            employees.push({
                companyId: companyId,
                fullName: `Employee ${i}`,
                firstName: `First${i}`,
                lastName: `Last${i}`,
                workEmail: `employee${i}@company.com`,
                phone: `+91${9000000000 + i}`,
                employeeId: `EMP${String(i).padStart(4, '0')}`,
                dob: new Date(1985 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                status: Math.random() > 0.1 ? 'ACTIVE' : 'PENDING_APPROVAL',
                systemRole: ['EMPLOYEE', 'HR', 'TL'][Math.floor(Math.random() * 3)],
                personal: {
                    about: {
                        salutation: 'Mr',
                        preferredName: `Emp${i}`,
                        aboutYourself: `Professional employee ${i}`
                    },
                    addresses: [{
                        addressType: 'HOME',
                        line1: `${100 + i} Main Street`,
                        city: ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad'][Math.floor(Math.random() * 4)],
                        state: ['Karnataka', 'Maharashtra', 'Delhi', 'Telangana'][Math.floor(Math.random() * 4)],
                        country: 'India'
                    }],
                    contacts: [{
                        contactType: 'PERSONAL',
                        contactTag: 'MOBILE',
                        details: `+91${9000000000 + i}`
                    }],
                    importantDates: {
                        birthDate: new Date(1985 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
                    },
                    dependents: []
                },
                education: [{
                    educationType: 'DEGREE',
                    instituteName: 'Sample University',
                    levelOfStudy: 'BACHELOR',
                    fieldOfStudy: 'Computer Science',
                    startDate: new Date(2010, 0, 1),
                    endDate: new Date(2014, 5, 30)
                }],
                documents: [{
                    type: 'PAN',
                    documentNumber: `PAN${String(i).padStart(8, '0')}`,
                    nameOnDocument: `Employee ${i}`
                }],
                workProfile: {
                    dateOfJoining: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), 1),
                    employmentType: 'FULL_TIME',
                    employmentGrade: ['JUNIOR', 'SENIOR', 'LEAD'][Math.floor(Math.random() * 3)],
                    selfService: true
                },
                pastExperience: [{
                    companyName: 'Previous Company ' + Math.floor(Math.random() * 5),
                    workRole: 'Developer',
                    startDate: new Date(2015, 0, 1),
                    endDate: new Date(2020, 0, 1)
                }]
            });
        }
        const insertedEmployees = await Employee.insertMany(employees);
        console.log(`✅ Inserted ${insertedEmployees.length} employees`);

        // ==========================================
        // INSERT ATTENDANCE
        // ==========================================
        const attendanceRecords = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const usedCombinations = new Set();

        for (let d = 6; d >= 0; d--) {
            const date = new Date(today);
            date.setDate(date.getDate() - d);

            for (const employee of insertedEmployees) {
                const dateString = date.toISOString().split('T')[0];
                const key = `${employee._id.toString()}-${dateString}`;

                if (usedCombinations.has(key)) continue;

                const randomStatus = Math.random();
                let status = 'present';
                if (randomStatus > 0.9) status = 'absent';
                else if (randomStatus > 0.8) status = 'late';
                else if (randomStatus > 0.7) status = 'half-day';

                attendanceRecords.push({
                    companyId: companyId,
                    employeeId: employee._id,
                    date: new Date(date),
                    status: status,
                    checkInTime: new Date(date.getTime() + Math.random() * 3600000),
                    checkOutTime: new Date(date.getTime() + 28800000 + Math.random() * 3600000)
                });

                usedCombinations.add(key);
            }
        }

        await Attendance.insertMany(attendanceRecords);
        console.log(`✅ Inserted ${attendanceRecords.length} attendance records`);

        // ==========================================
        // INSERT INTERVIEWS
        // ==========================================
        const interviews = [];
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        for (let i = 0; i < 15; i++) {
            const randomDate = new Date(weekStart.getTime() + Math.random() * (weekEnd - weekStart));
            interviews.push({
                companyId: companyId,
                candidateName: `Candidate ${i + 1}`,
                email: `candidate${i + 1}@email.com`,
                position: `Position ${(i % 5) + 1}`,
                scheduledDate: randomDate,
                interviewerName: insertedEmployees[Math.floor(Math.random() * insertedEmployees.length)].fullName,
                status: 'scheduled'
            });
        }
        await Interview.insertMany(interviews);
        console.log(`✅ Inserted ${interviews.length} interviews`);

        // ==========================================
        // INSERT APPLICATIONS
        // ==========================================
        const applications = [];
        for (let i = 0; i < 50; i++) {
            const randomDate = new Date(weekStart.getTime() + Math.random() * (weekEnd - weekStart));
            applications.push({
                companyId: companyId,
                candidateName: `Applicant ${i + 1}`,
                email: `applicant${i + 1}@email.com`,
                position: `Position ${(i % 5) + 1}`,
                appliedDate: randomDate,
                status: ['new', 'reviewing', 'shortlisted', 'rejected'][Math.floor(Math.random() * 4)],
                rating: Math.floor(Math.random() * 5) + 1
            });
        }
        await Application.insertMany(applications);
        console.log(`✅ Inserted ${applications.length} applications`);

        // ==========================================
        // INSERT LEAVE REQUESTS
        // ==========================================
        const leaveRequests = [];
        const leaveTypes = ['Annual', 'Sick', 'Personal', 'Maternity', 'Paternity'];

        for (let i = 0; i < 30; i++) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30) + 1);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 5) + 1);

            const randomEmployee = insertedEmployees[Math.floor(Math.random() * insertedEmployees.length)];
            leaveRequests.push({
                companyId: companyId,
                employeeId: randomEmployee._id,
                employeeName: randomEmployee.fullName,
                startDate: startDate,
                endDate: endDate,
                leaveType: leaveTypes[Math.floor(Math.random() * leaveTypes.length)],
                reason: `Leave request reason ${i + 1}`,
                status: ['Pending', 'Approved', 'Rejected'][Math.floor(Math.random() * 3)]
            });
        }
        await LeaveRequest.insertMany(leaveRequests);
        console.log(`✅ Inserted ${leaveRequests.length} leave requests`);

        // ==========================================
        // INSERT EVENTS
        // ==========================================
        const events = [];
        const eventTypes = ['Workshop', 'Training', 'Meeting', 'Orientation', 'Review', 'Other'];
        const eventStatuses = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];
        const locations = ['Conference Room A', 'Conference Room B', 'Auditorium', 'Training Hall', 'Virtual', 'Office Cafeteria'];
        
        for (let i = 0; i < 25; i++) {
            const eventDate = new Date();
            eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 60) - 10); // Past and future events
            
            const eventHour = Math.floor(Math.random() * 24);
            const eventMinute = Math.floor(Math.random() * 60);
            const eventTime = `${String(eventHour).padStart(2, '0')}:${String(eventMinute).padStart(2, '0')}`;

            const randomOrganizer = insertedEmployees[Math.floor(Math.random() * insertedEmployees.length)];

            events.push({
                companyId: companyId,
                organizer: randomOrganizer._id,
                title: `${eventTypes[Math.floor(Math.random() * eventTypes.length)]} - Event ${i + 1}`,
                description: `This is a detailed description for event ${i + 1}. It includes important information about the event.`,
                eventDate: eventDate,
                eventTime: eventTime,
                location: locations[Math.floor(Math.random() * locations.length)],
                eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
                status: eventStatuses[Math.floor(Math.random() * eventStatuses.length)],
                isActive: Math.random() > 0.2 ? true : false,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
        await Event.insertMany(events);
        console.log(`✅ Inserted ${events.length} events`);

        console.log('\n✅ Database seeded successfully!');
        console.log(`📊 Summary:`);
        console.log(`   - Company ID: ${companyId}`);
        console.log(`   - Employees: ${insertedEmployees.length}`);
        console.log(`   - Attendance Records: ${attendanceRecords.length}`);
        console.log(`   - Interviews: ${interviews.length}`);
        console.log(`   - Applications: ${applications.length}`);
        console.log(`   - Leave Requests: ${leaveRequests.length}`);
        console.log(`   - Events: ${events.length}`);

        await mongoose.connection.close();
        console.log('\n✅ Connection closed');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        await mongoose.connection.close();
    }
}

seedDatabase();