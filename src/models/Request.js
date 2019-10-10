import { Schema, model } from 'mongoose';

const requestSchema = Schema({
  carId: { type: Schema.Types.ObjectId, ref: 'Car' },
  driver: { type: Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    default: 'open'
  },
  date: {
    type: Date,
    default: Date.now
  },

});
module.exports = model('Request', requestSchema);
