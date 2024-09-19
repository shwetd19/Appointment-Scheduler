const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const userModel = require("../models/userModels");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");

// Register user
const registerController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send({
        message: "User already exists",
        success: false,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new userModel({ ...req.body, password: hashedPassword });

    await newUser.save();
    res.status(201).send({ message: "Registered successfully", success: true });
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).send({
      message: `Error in Register Controller: ${error.message}`,
      success: false,
    });
  }
};

// Login user
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found", success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Invalid email or password", success: false });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(200).send({ message: "Login successful", success: true, token });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).send({ message: `Error in Login Controller: ${error.message}`, success: false });
  }
};

// Auth user
const authController = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId).select("-password");
    if (!user) {
      return res.status(404).send({ message: "User not found", success: false });
    }
    res.status(200).send({ success: true, data: user });
  } catch (error) {
    console.error("Auth Error:", error.message);
    res.status(500).send({ message: `Error in Auth Controller: ${error.message}`, success: false });
  }
};

// Apply for Doctor
const applyDoctorController = async (req, res) => {
  try {
    const newDoctor = new doctorModel({ ...req.body, status: "pending" });
    await newDoctor.save();

    const adminUser = await userModel.findOne({ isAdmin: true });
    adminUser.notification.push({
      type: "apply-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for a Doctor account`,
      data: { doctorId: newDoctor._id, name: `${newDoctor.firstName} ${newDoctor.lastName}` },
      onClickPath: "/admin/doctors",
    });
    await adminUser.save();

    res.status(201).send({ message: "Doctor application submitted", success: true });
  } catch (error) {
    console.error("Apply Doctor Error:", error.message);
    res.status(500).send({ message: `Error applying for doctor: ${error.message}`, success: false });
  }
};

// Get all notifications
const getAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId);
    user.seenNotification.push(...user.notification);
    user.notification = [];

    await user.save();
    res.status(200).send({ message: "All notifications marked as read", success: true, data: user });
  } catch (error) {
    console.error("Notification Error:", error.message);
    res.status(500).send({ message: `Error fetching notifications: ${error.message}`, success: false });
  }
};

// Delete all notifications
const deleteAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId);
    user.notification = [];
    user.seenNotification = [];

    await user.save();
    res.status(200).send({ message: "Notifications deleted successfully", success: true, data: user });
  } catch (error) {
    console.error("Delete Notification Error:", error.message);
    res.status(500).send({ message: `Error deleting notifications: ${error.message}`, success: false });
  }
};

// Get all doctors
const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({ status: "approved" });
    res.status(200).send({ message: "Doctors fetched successfully", success: true, data: doctors });
  } catch (error) {
    console.error("Fetch Doctors Error:", error.message);
    res.status(500).send({ message: `Error fetching doctors: ${error.message}`, success: false });
  }
};

// Book appointment
const bookAppointmentController = async (req, res) => {
  try {
    const { doctorInfo, userInfo } = req.body;
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH:mm").toISOString();
    req.body.status = "pending";

    const newAppointment = new appointmentModel(req.body);
    await newAppointment.save();

    const doctor = await userModel.findById(doctorInfo.userId);
    doctor.notification.push({
      type: "New-appointment-request",
      message: `A new appointment request from ${userInfo.name}`,
      onClickPath: "/user/appointments",
    });
    await doctor.save();

    res.status(200).send({ message: "Appointment booked successfully", success: true });
  } catch (error) {
    console.error("Book Appointment Error:", error.message);
    res.status(500).send({ message: `Error booking appointment: ${error.message}`, success: false });
  }
};

// Check appointment availability
const bookingAvailabilityController = async (req, res) => {
  try {
    const { date, time, doctorId } = req.body;
    const formattedDate = moment(date, "DD-MM-YYYY").toISOString();
    const fromTime = moment(time, "HH:mm").subtract(1, "hours").toISOString();
    const toTime = moment(time, "HH:mm").add(1, "hours").toISOString();

    const appointments = await appointmentModel.find({
      doctorId,
      date: formattedDate,
      time: { $gte: fromTime, $lte: toTime },
    });

    if (appointments.length > 0) {
      return res.status(200).send({ message: "No available appointments at this time", success: false });
    }

    res.status(200).send({ message: "Appointments available", success: true });
  } catch (error) {
    console.error("Booking Availability Error:", error.message);
    res.status(500).send({ message: `Error checking availability: ${error.message}`, success: false });
  }
};

module.exports = {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDoctorsController,
  bookAppointmentController,
  bookingAvailabilityController,
};
