// models/contact.model.js

import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  message: String,
}, {
  timestamps: true
});

export default mongoose.model("Contact", contactSchema);
