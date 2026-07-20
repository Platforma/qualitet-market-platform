const connectDB = async () => {
  return new Promise((resolve) => {
    console.log('Mock DB connected successfully');
    resolve();
  });
};

module.exports = connectDB;
