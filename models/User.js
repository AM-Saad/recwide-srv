const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  image: String,
  resetToken: String,
  resetTokenExpr: Date,
  signUpToken: String,
  signUpTokenExpr: Date,
  projects: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Project",
    },
  ],
  passkey_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PublicKeyCred',
}
});

module.exports = mongoose.model("User", userSchema);
