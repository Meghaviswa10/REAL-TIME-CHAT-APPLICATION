const asyncHandler = require("express-async-handler");
const admin = require("firebase-admin");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messagesRef = admin.firestore().collection('messages');
    const snapshot = await messagesRef.where('chat', '==', req.params.chatId).get();
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    res.status(500).send("Error fetching messages");
  }
});

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    await admin.firestore().collection('messages').add(newMessage);
    res.json(newMessage);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { allMessages, sendMessage };
