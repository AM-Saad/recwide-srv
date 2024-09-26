const mongoose = require("mongoose");

const publicKeyCredSchema = new mongoose.Schema({
  public_key: {
    type: String,
    required: true,
  },
  passkey_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  backed_up: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
  },
  transports: {
    type: [String],
  },
});

module.exports = mongoose.model("PublicKeyCred", publicKeyCredSchema);
