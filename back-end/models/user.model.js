const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getNextSequenceValue } = require('./counter.model');

const UserSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  displayId: { type: Number, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  mobile: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'User'], default: 'User' },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  otp: { type: String },
  otpExpiry: { type: Date },
  lastLogin: { type: Date },
  userGuid: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  const user = this;
  
  if (user.isNew) {
    user.userGuid = uuidv4();
    user.id = await getNextSequenceValue('userId');
    user.displayId = await getNextSequenceValue('userDisplayId') + 1000; // starts at 1001
  }

  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Prevent deleting original admin
UserSchema.pre(['deleteOne', 'findOneAndDelete', 'findByIdAndDelete'], async function (next) {
  try {
    const query = this.getQuery();
    const user = await this.model.findOne(query);
    if (user && user.email === 'mahavirautomation111@gmail.com') {
      return next(new Error('Protected administrator account cannot be deleted.'));
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Prevent updating role of original admin
UserSchema.pre(['updateOne', 'findOneAndUpdate', 'findByIdAndUpdate'], async function (next) {
  try {
    const query = this.getQuery();
    const update = this.getUpdate();
    
    if (update && (update.role !== undefined || (update.$set && update.$set.role !== undefined))) {
      const newRole = update.role !== undefined ? update.role : update.$set.role;
      if (newRole !== 'Admin') {
        const user = await this.model.findOne(query);
        if (user && user.email === 'mahavirautomation111@gmail.com') {
          return next(new Error('Protected administrator role cannot be modified.'));
        }
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Prevent saving role changes for original admin
UserSchema.pre('save', function (next) {
  if (!this.isNew && this.isModified('role') && this.email === 'mahavirautomation111@gmail.com' && this.role !== 'Admin') {
    return next(new Error('Protected administrator role cannot be modified.'));
  }
  next();
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
