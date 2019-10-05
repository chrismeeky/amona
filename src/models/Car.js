import { Schema, model } from 'mongoose';

const carSchema = Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  model: {
    type: String,
    max: 20,
    min: 5,
    required: true,
  },
  year: {
    type: Number,
    min: 2004,
    max: Date.now.year,
    required: true,
  },
  mileage: {
    type: Number,
    max: 300000,
    required: true,
  },
  extractedLicenseNumber: {
    type: String,
    max: 10,
    min: 8,
    required: true,
  },
  userInputedLicenseNumber: {
    type: String,
    max: 10,
    min: 9,
    required: true,
  },
  color: {
    type: String
  },
  leather: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    min: 5,
    required: true,
  },
  purpose: {
    type: String,
    default: 'for rent'
  },
  pictures: {
    type: Array,
    min: 6,
    max: 8,
    required: true
  },
  status: {
    type: String,
    default: 'available',
  },
  terms: {
    type: String,
    max: 500,
    required: true,
  },
  interval: {
    type: String,
    default: 'weekly',
  },
  remittance: {
    type: Number,
    default: 25000
  },
  contractDuration: {
    type: String,
    default: 'not specified'
  }

});
module.exports = model('Car', carSchema);
