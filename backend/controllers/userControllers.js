const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const admin = require("firebase-admin");
const generateToken = require("../config/generateToken");

//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  try {
    const usersRef = admin.firestore().collection('users');
    const snapshot = await usersRef.get(); 
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    
    const filteredUsers = req.query.search 
      ? users.filter(user => 
          user.name.match(new RegExp(req.query.search, 'i')) || 
          user.email.match(new RegExp(req.query.search, 'i'))
        )
      : users;

    res.send(filteredUsers);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).send("Error fetching users");
  }
});

//@description     Register new user
//@route           POST /api/user/
//@access          Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Fields");
  }

  const userRef = await admin.firestore().collection('users').doc(email).get();
  if (userRef.exists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = {
    name,
    email,
    password: hashedPassword, 
    pic,
  };
  await admin.firestore().collection('users').doc(email).set(user);

  res.status(201).json({
    _id: email,
    name: user.name,
    email: user.email,
    isAdmin: false, 
    pic: user.pic,
    token: generateToken(email), 
  });
});

//@description     Auth the user
//@route           POST /api/users/login
//@access          Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const userRef = await admin.firestore().collection('users').doc(email).get();
  const user = userRef.exists ? userRef.data() : null;

  if (user && await bcrypt.compare(password, user.password)) { 
    console.log("User found:", user); 
    console.log(`User ${email} logged in successfully.`);
    console.log("Login successful for user:", email); 
    res.json({
      _id: email,
      name: user.name,
      email: user.email,
      isAdmin: false,
      pic: user.pic,
      token: generateToken(email),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

module.exports = { allUsers, registerUser, authUser };
