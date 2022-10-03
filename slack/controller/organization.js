const MyError = require("../helper/error");
const { getTokenFromHeader, tokenDecoder, tokenMaker } = require("../helper/jwt");

const Organization = require("../model/organization");
const User = require("../model/user");

exports.getOrganization = async (req, res) => {
  try {
    const token = getTokenFromHeader(req);
    const { id, username, role, workspace, organization } = tokenDecoder(token);
    if (role === "admin" || role === "sub-admin") {
      Organization.findOne({ organizationName: organization },
        (err, result) => {
          if (err) {
            throw new MyError(500, "ERROR", err.message);
          } else if (result === null || result === undefined) {
            return res.status(200).json({
              status: "OK",
              message: "No such organization exist!!"
            });
          } else if (!result.isActive) {
            return res.status(201).json({
              status: "OK",
              message: "This organization has been deactivated!"
            });
          }
          return res.status(200).json({
            status: "OK",
            message: "Data fetched successfully",
            payload: result
          });
        }
      );
    }
    else {
      throw new MyError(403, "ERROR", "Unauthorized");
    }
  } catch (err) {
    return res.status(err.statusCode).json({
      status: "ERROR",
      message: err.message
    });
  }
};

exports.createOrganization = async (req, res) => {
  try {
    const { organizationName } = req.body;
    const token = getTokenFromHeader(req);
    const { id, username, role, workspace, organization, name } = tokenDecoder(token);
    if (role === "user" && organization === null && workspace === null) {
      const newOrganization = new Organization({
        admin: username,
        organizationName
      });
      const payload = {
        id,
        username,
        role: "admin",
        organization: organizationName,
        name,
        workspace
      };
      const newToken = tokenMaker(payload);
      User.findOneAndUpdate({ username }, {
        $set: {
          role: "admin",
          organization: organizationName
        },
      }).then((user) => {
        newOrganization.save().then(() => res.status(201).json({
          status: "OK",
          mssage: "New organization has been created!!",
          token: newToken
        })).catch((err) => res.status(500).json({
          status: "ERROR",
          message: err.message
        }));
      }
      ).catch((err) => (err.statusCode || 500).json({
        status: "ERROR",
        message: err.message || "Something went wrong!!"
      }));
    } else {
      throw new MyError(403, "ERROR", "Unauthorized");
    }
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      status: "ERROR",
      message: err.message || "Something went wrong"
    });
  }
};

exports.addSubAdmin = async (req, res) => {
  const { username } = req.body;

  try {
    const token = getTokenFromHeader(req);
    const { id, role, workspace, organization } = tokenDecoder(token);
    if (role === "admin") {
      User.findOneAndUpdate({ username: username }, {
        $set: {
          role: "sub-admin",
          organization: organization
        }
      }).then(async (user) => {
        await Organization.findOneAndUpdate({ organizationName: organization }, {
          $addToSet: {
            subAdmin: username
          }
        });
        return res.status(200).json({
          status: "OK",
          message: `Role of ${username} has been changed to sub-admin`
        });
      }
      ).catch((err) => res.status(500).json({
        status: "ERROR",
        message: err.message
      }));
    } else {
      throw new MyError(403, "ERROR", "Unauthorized");
    }
  } catch (err) {
    return res.status(500 || err.statusCode).json({
      status: "ERROR",
      message: err.message || "Something went wrong!!"
    });
  }
};

exports.removeSubAdmin = async (req, res) => {
  const { username } = req.body;
  try {
    const token = getTokenFromHeader(req);
    const { role, organization } = tokenDecoder(token);
    if (role === "admin") {
      const user = await User.findOne({ username: username });
      if (user.role === "user") {
        throw new MyError(404, "ERROR", "User is not a sub-admin");
      }
      User.findOneAndUpdate({ username: username }, {
        $set: {
          role: "user"
        },
        $unset: { organization }
      }).then(async (user) => {
        await Organization.findOneAndUpdate({ organizationName: organization }, {
          $pull: {
            subAdmin: {
              $in: [ username ]
            }
          }
        });
        return res.status(200).json({
          status: "OK",
          message: `Role of ${username} has been changed to user from sub-admin`
        });
      }).catch(
        (err) => res.status(500).json({
          status: "ERROR",
          message: err.message
        })
      );
    }
    else {
      throw new MyError(403, "ERROR", "Unauthorized");
    }
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      status: "ERROR",
      message: err.message || "Something went wrong!!"
    });
  }
};