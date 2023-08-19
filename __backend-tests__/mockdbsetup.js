const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongo = null;
 
const connectDB = async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  console.log('mockdbsetup, ln9:', uri);
 
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('mockdbsetup, ln15:', mongo);
};

const dropDB = async () => {
    if (mongo) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
      await mongo.stop();
    }
};

const dropCollections = async () => {
    if (mongo) {
      const collections = await mongoose.connection.db.collections();
      for (let collection of collections) {
        await collection.deleteMany();
      }
    }
  };


module.exports = { connectDB, dropDB, dropCollections}