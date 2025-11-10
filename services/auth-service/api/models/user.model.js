// models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { isEmail } = require('validator');
const USER_ROLES = require('../enums/roles.enum');

const SALT_ROUNDS = 10;

// enums/roles.enum.js

const USER_ROLES = Object.freeze({
    DOCTOR: 'doctor',
    PATIENT: 'patient',
    ADMIN: 'admin',
  });
  
  

  const userSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [2, "Name must be at least 2 characters long"],
      },
      email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        match: [/.+\@.+\..+/, "Please fill a valid email address"],
      },
      password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
        select: false, // ensures password isn’t returned in queries
      },
      role: {
        type: String,
        enum: Object.values(USER_ROLES),
        default: USER_ROLES.PATIENT,
      },
      refreshToken: {
        type: String,
        default: null,
      },
    },
    { timestamps: true }
  );
  
  // 🔒 Hash password before saving
  userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });
  
  // ✅ Compare password method
  userSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
  };
  
  // 🔍 Find user by email static
  userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email }).select("+password");
  };
  
  export const User = mongoose.model("User", userSchema);


module.exports = {User, USER_ROLES };
