import mongoose from 'mongoose';

const connectDatabase = async () => {
  try {
    const connected = await mongoose.connect(process.env.DB_STRING,
      { useNewUrlParser: true, useUnifiedTopology: true });
    if (connected) {
      console.info('connection has been established');
    }
  } catch (error) {
    console.info(error);
  }
};

export default connectDatabase();
