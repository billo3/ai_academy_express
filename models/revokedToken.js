const mongoose = require("mongoose");

const revokedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  expireAt: {
    type: Date,
    required: true
  }
});

// Supprimer automatiquement les tokens expirés
revokedTokenSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("RevokedToken", revokedTokenSchema);