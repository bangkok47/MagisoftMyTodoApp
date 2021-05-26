const mongoose = require('mongoose');

const MONGOURI = 'mongodb+srv://NewUser:1111qqqq@cluster0.rakxb.mongodb.net/test';

const InitiateMongoServer = async () => {
  try {
    await mongoose.connect(MONGOURI, {
      useNewUrlParser: true,
    });
    console.log('Connected to DB !!');
  } catch (e) {
    console.log(e);
    throw e;
  }
};

//InitiateMongoServer(); // запустить один раз для теста, потом закомментировать
module.exports = InitiateMongoServer;
