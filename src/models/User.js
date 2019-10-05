import { Schema, model } from 'mongoose';

const userSchema = Schema({
  firstName: {
    type: String,
    required: true,
    max: 20,
    min: 2,
  },
  lastName: {
    type: String,
    required: true,
    max: 20,
    min: 2,
  },
  email: {
    type: String,
    required: true,
    max: 255,
    min: 6,
  },
  username: {
    type: String,
    required: true,
    max: 20,
    min: 3,
  },
  password: {
    type: String,
    required: true,
    max: 1024,
    min: 6,
  },
  address: {
    type: String,
    min: 5,
    max: 50,
  },
  city: {
    type: String,
    min: 2,
    max: 15
  },
  state: {
    type: String,
    min: 3,
    max: 15,
  },
  phoneNumber: {
    type: String,
    min: 8,
    max: 12,
  },
  profilePicture: {
    type: String,
    min: 10,
    max: 100
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isSubscribed: {
    type: Boolean,
    default: true,
  },
  hasProfile: {
    type: Boolean,
    default: false,
  },
  rememberDetails: {
    type: Boolean,
    default: false,
  },
  private: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    default: 'active',
  },
  role: {
    type: String,
    default: 'member'
  },
  date: {
    type: Date,
    default: Date.now
  },
  cars: [{ type: Schema.Types.ObjectId, ref: 'Car' }]
});

module.exports = model('User', userSchema);
