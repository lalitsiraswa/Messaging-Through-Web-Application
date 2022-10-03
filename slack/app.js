const express = require("express");
const morgan = require("morgan");
const dotEnv = require("dotenv").config();
const { Kafka } = require("kafkajs");

const dbConnect = require("./helper/mongooseConfigurer");


const userRoutes = require("./routes/user");
const fileRoutes = require("./routes/file");
const inviteRoutes = require("./routes/invite");
const messageRoutes = require("./routes/message");
const workSpaceRoutes = require("./routes/workspace");
const groupChannelRoutes = require("./routes/groupChannel");
// const organizationRoutes = require("./routes/organization");
const personalChannelRoutes = require("./routes/personalChannel");

const app = express();

const MONGO_URI = process.env.ATLAS_URI;

dbConnect.connectMongo(MONGO_URI);

const kafka = new Kafka({
  clientId: "my-app",
  brokers: [ "localhost:9092" ],

});
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//routes
app.use(userRoutes);
app.use(fileRoutes);
app.use(inviteRoutes);
app.use(messageRoutes);
app.use(workSpaceRoutes);
app.use(groupChannelRoutes);
// app.use(organizationRoutes);
app.use(personalChannelRoutes);

app.get("/list", async (req, res) => {
  const list = await kafka.admin().listTopics();
  // const a = kafka.admin().;
  return res.status(200).json(list);

});

app.use((req, res, next) => {
  const error = new Error('No route found!!');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => res.status(error.status || 500).json({
  status: "ERROR",
  message: error.message
})
);



module.exports = app;
