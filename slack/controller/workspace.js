const mongoose = require("mongoose");
const shortId = require("shortid");

const { getTokenFromHeader, tokenDecoder, tokenMaker } = require("../helper/jwt");

const User = require("../model/user");
const Workspace = require("../model/workspace");
const GroupChannel = require("../model/groupChannel");
const MyError = require("../helper/error");

exports.addWorkspace = async (req, res) => {
	try {
		let { workspaceName, username } = req.body;
		const incomingToken = getTokenFromHeader(req);
		const decodedToken = tokenDecoder(incomingToken);
		workspaceName += "@" + shortId.generate();
		const generalChannel = new GroupChannel({
			_id: new mongoose.Types.ObjectId(),
			channelName: "general@" + shortId.generate(),
			avatarUrl: "",
			participants: [ { name: username } ],
		});
		const workspace = new Workspace({
			_id: new mongoose.Types.ObjectId(),
			workspaceName: workspaceName,
			owner: username,
			handlers: [],
			employees: [],
			channels: [ { name: generalChannel.channelName } ],
			invites: [],
		});
		const userToBeUpdated = await User.findOne({ username });
		if (userToBeUpdated.role === "admin") {
			throw new MyError(
				403,
				"ERROR",
				"User is already a admin of some workspace!"
			);
		}
		if (decodedToken.workspace !== null) {
			throw new MyError(403, "ERROR", "You must not be in any workspace!!");
		}
		if (decodedToken.role === "user") {
			User.findOneAndUpdate({ username: username }, {
				$set: {
					workspace: workspaceName,
					role: "admin",
				},
			}).then((user) => {
				const payload = {
					id: user._id,
					username: user.username,
					role: "admin",
					workspace: workspaceName,
					name: user.name
				};
				generalChannel.save().then(() => {
					workspace.save().then(() => {
						const token = tokenMaker(payload);
						return res.status(201).json({
							status: "OK",
							message: `Workspace created successfully!!`,
							payload: payload,
							token
						});
					}).catch((err) => res.status(500).json({
						status: "ERROR",
						message: err.message,
					}));
				}).catch((err) => res.status(500).json({
					status: "ERROR",
					message: err.message,
				}));
			}).catch((err) => res.status(500).json({
				status: "ERROR",
				message: err.message,
			}));
		} else {
			throw new MyError(403, "ERROR", "Unauthorized!!");
		}
	} catch (err) {
		return res.status(err.statusCode || 500).json({
			status: err.status || "ERROR",
			message: err.message,
		});
	}
};

exports.addEmployee = async (req, res) => {
	try {
		const { username } = req.body;
		const incomingToken = getTokenFromHeader(req);
		const decodedToken = tokenDecoder(incomingToken);
		const isUserInworkspace = await User.findOne({ username });
		if (
			(decodedToken.role === "admin" || decodedToken.role === "handler") &&
			(isUserInworkspace.workspace === null ||
				isUserInworkspace.workspace === undefined)
		) {
			Workspace.findOneAndUpdate({ workspaceName: decodedToken.workspace }, {
				$addToSet: {
					employees: username,
				},
			}).then(async (workspace) => {
				await User.updateOne({ username: username }, {
					$set: {
						groupChannels: workspace.channels[ 0 ].name,
						workspace: workspace.workspaceName,
					}
				});
				return workspace;
			}).then(async (workspace) => {
				await GroupChannel.findOneAndUpdate({ channelName: workspace.channels[ 0 ].name }, {
					$addToSet: {
						participants: {
							username: username,
						},
					},
				});
				return res.status(200).json({
					status: "OK",
					message: `${username} added to ${decodedToken.workspace} and default general channel successfully!!`,
				});
			}
			).catch((err) => res.status(err.status || 500).json({
				status: "ERROR",
				message: err.message,
			}));
		} else if (isUserInworkspace.workspace !== null) {
			throw new MyError(
				403,
				"ERROR",
				"Cannot add user who is already in some workspace"
			);
		} else if (role !== "owner" && role !== "handler") {
			throw new MyError(403, "ERROR", "Unauthorized");
		}
	} catch (err) {
		return res.status(err.statusCode || 500).json({
			status: err.status || "ERROR",
			message: err.message,
		});
	}
};

exports.addHandlers = async (req, res) => {
	try {
		const { username } = req.body;
		const token = getTokenFromHeader(req);
		const decodedToken = tokenDecoder(token);
		if (decodedToken.role === "admin") {
			Workspace.findOneAndUpdate({ workspaceName: decodedToken.workspace }, {
				$addToSet: {
					handlers: username,
				},
			}).then(async (result) => {
				await User.findOneAndUpdate({ username: username }, {
					$set: {
						role: "handler",
						workspace: decodedToken.workspace,
					}
				});
				return res.status(200).json({
					status: "OK",
					message: "handler added successfully!!",
				});
			}).catch((err) => res.status(err.status).json({
				status: "ERROR",
				message: err.message,
			}));
		} else {
			throw new MyError(403, "ERROR", "Unauthorized!!");
		}
	} catch (err) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		});
	}
};

exports.getWorkspace = async (req, res) => {
	try {
		const token = getTokenFromHeader(req);
		const { workspace } = req.query;
		const { role, username } = tokenDecoder(token);
		Workspace.findOne({ workspaceName: workspace }).then(async (result) => {
			// const channels = result.channels..sort((a, b) => -(a.lastMessage - b.lastMessage)).map();
			// console.log(channels);
			const user = await User.findOne({ username });
			return res.status(200).json({
				status: "OK",
				message: "Workspace found successfully!!",
				payload: { result, directMessage: user.directMessage.sort((a, b) => -(a.lastMessage - b.lastMessage)), notification: user.notification },
			});
		}).catch((err) => res.status(500).json({
			status: "ERROR",
			message: err.message,
		}));
	} catch (err) {
		return res.status(err.statusCode || 500).json({
			status: err.status || "ERROR",
			message: err.message || "Something went wrong!!",
		});
	}
};

exports.invitesList = async (req, res) => {
	try {
		const { page } = req.query;
		const token = getTokenFromHeader(req);
		const { role, workspace } = tokenDecoder(token);
		if (role === "handler" || role === "owner") {
			Workspace.findOne({ workspaceName: workspace }, {
				invites: {
					$slice: [ page * 10, 10 ],
				},
			}).exec().then((result) => res.status(200).json({
				status: "OK",
				message: "User invites has been fetched successfully!!",
				payload: result.invites,
			})
			).catch((err) => res.staus(500).json({
				status: "ERROR",
				message: err.message,
			})
			);
		} else {
			const error = new Error();
			error.message = "Unauthorized Access!!";
			error.status = 403;
			throw error;
		}
	} catch (err) {
		return res.status(err.status || 500).json({
			status: "ERROR",
			message: err.message || "Something went wrong",
		});
	}
};

// exports.getWorkspaceUsers = async (req, res) => {
// 	try {
// 		const incomingToken = getTokenFromHeader(req);
// 		const token = tokenDecoder(incomingToken);
// 		const { username } = req.params;
// 		const exp = username;
// 		const reg = new RegExp(exp, "g");
// 		User.find({ $and: [ { username: { $ne: token.username } }, { username: reg, workspace: token.workspace } ] }).limit(10).then((result) => {
// 			const array = result.map(
// 				(user) => {
// 					return {
// 						username: user.username
// 					};
// 				}
// 			);
// 			return res.status(200).json({
// 				status: "OK",
// 				message: "Users",
// 				payload: array
// 			});
// 		}).catch(
// 			(err) => res.status(500).json({
// 				status: "ERROR",
// 				message: err.message
// 			})
// 		);
// 	} catch (err) {
// 		return res.status(err.statusCode || 500).json({
// 			status: err.status || "ERROR",
// 			message: err.message || "Internal server error!"
// 		});
// 	}
// };


// exports.acceptInvites = async (req, res) => { };
