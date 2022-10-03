const jsonwebtoken = require("jsonwebtoken");
const MyError = require("./error");

exports.tokenMaker = (payload, days = '5d') => {
  return jsonwebtoken.sign(payload, process.env.JWT_SECRET, {
    expiresIn: days
  });
};

exports.tokenVerifier = (req, res, next) => {
  try {
    const token = this.getTokenFromHeader(req);
    jsonwebtoken.verify(token, process.env.JWT_SECRET);
    next();
  }
  catch (err) {
    return res.status(401).json({
      status: "ERROR",
      message: err.message
    });
  }
};

exports.tokenDecoder = (token) => {
  return jsonwebtoken.decode(token);
};

exports.getTokenFromHeader = (req) => {
  try {
    const authHeader = req.headers[ "authorization" ];
    if (authHeader === undefined || authHeader === null) {
      throw new MyError(401, "ERROR", "No token found");
    }
    const token = authHeader && authHeader.split(" ")[ 1 ];
    return token ? token : null;
  } catch (err) {
    throw err;
  }
};