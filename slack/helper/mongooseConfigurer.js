const mongoose = require("mongoose");

exports.connectMongo = async (uri) => {
  await mongoose.connect(uri).then(
    () => {
      console.log("Mongo is hot!!");
    }
  ).catch(
    (err) => {
      console.log(err);
    }
  );
};
