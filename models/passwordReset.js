const mongoose = require("mongoose");
const { Schema } = mongoose;

const passwordResetSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Expire après 1 heure
  }
});

module.exports = mongoose.model("PasswordReset", passwordResetSchema);