const mongoose = require("mongoose");
const autoIncrement = require("mongoose-sequence")(mongoose); // Requires mongoose-sequence

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  conversationId: {
    type: Number,
    unique: true,
  },
  messages: [{
    sender: {
      type: String,
      enum: ['user', 'system'],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
});

// Auto-increment conversationId
conversationSchema.plugin(autoIncrement, {
  inc_field: 'conversationId',
  start_seq: 1000, // Starting sequence number for conversationId
});

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;
