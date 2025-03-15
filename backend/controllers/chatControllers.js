const asyncHandler = require("express-async-handler");
const admin = require("firebase-admin");

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  const chatsRef = admin.firestore().collection('chats');
  const snapshot = await chatsRef.where('isGroupChat', '==', false)
    .where('users', 'array-contains', req.user._id)
    .where('users', 'array-contains', userId)
    .get();
  
  let isChat = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    const chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };
    await chatsRef.add(chatData);

    try {
      const createdChatRef = await chatsRef.add(chatData);
      const createdChat = { id: createdChatRef.id, ...chatData };
      res.status(200).json(createdChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
const fetchChats = asyncHandler(async (req, res) => {
  try {
    const chatsRef = admin.firestore().collection('chats'); 
    console.log("Fetching chats for user ID:", req.user._id); 
    console.log("User ID:", req.user._id); 
    const chatsSnapshot = await chatsRef.where('users', 'array-contains', req.user._id).get(); 
    const results = chatsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); 
    res.status(200).send(results);
  } catch (error) {
    console.error("Error fetching chats:", error.message);
    res.status(500).send("Error fetching chats");
  }
});


//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the fields" });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req.user);

  try {
    const groupChat = {
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    };
    const groupChatRef = await chatsRef.add(groupChat);
    const fullGroupChat = { id: groupChatRef.id, ...groupChat };
    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const chatRef = chatsRef.doc(chatId);
  await chatRef.update({ chatName: chatName });
  const updatedChat = { id: chatId, chatName: chatName };

  res.json(updatedChat);
});

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const chatRef = chatsRef.doc(chatId);
  await chatRef.update({
    users: admin.firestore.FieldValue.arrayRemove(userId),
  });
  res.json({ id: chatId });
});

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const chatRef = chatsRef.doc(chatId);
  await chatRef.update({
    users: admin.firestore.FieldValue.arrayUnion(userId),
  });
  res.json({ id: chatId });
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
