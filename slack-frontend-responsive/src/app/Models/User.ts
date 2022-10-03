export type User = {
    name:String,
    username:String,
    email:String,
    password: String
}

// type User = {
    
// }

// const userSchema = new mongoose.Schema({
//     _id: mongoose.Schema.Types.ObjectId,
//     name: { type: String },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       validate: validator.isEmail,
//     },
//     username: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     role: { type: String, default: "user" },
//     workspace: { type: String },
//     organization: { type: String },
//     avatarUrl: { type: String },
//     address: { type: String },
//     directMessage: [
//       {
//         usrname: String,
//         chatId: String,
//       },
//     ],
//     groupChannels: [{ type: String }],
//   });