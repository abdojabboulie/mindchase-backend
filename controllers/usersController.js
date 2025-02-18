const User = require("../models/User");
const { validationResult } = require("express-validator");
const createError = require("http-errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort("lastName");
    res.status(200).send(users);
  } catch (e) {
    next(e);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new createError.NotFound();
    res.status(200).send(user);
  } catch (e) {
    next(e);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id).select(
      "-password"
    );
    if (!user) throw new createError.NotFound();
    res.status(200).send(user);
  } catch (e) {
    next(e);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) throw new createError.NotFound();
    res.status(200).send(user);
  } catch (e) {
    next(e);
  }
};

exports.addUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const user = new User(req.body);
    await user.save();
    res.status(200).send(user);
  } catch (e) {
    next(e);
  }
};
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const emailRegex = /@gmail.com|@yahoo.com|@hotmail.com|@live.com/;

  if (!emailRegex.test(email))
    throw Error("Email is not supported from your domain.");
  if (password.length < 6)
    throw Error("Password must be atleast 6 characters long.");

  const userExists = await User.findOne({
    email,
  });

  if (userExists) throw Error("User with same email already exits.");

  const user = new User({
    name,
    email,
    password,
  });

  await user.save();

  res.json({
    message: "User [" + name + "] registered successfully!",
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    email, 
  });
  if (!user) throw Error("Email and Password did not match.");
  try {
    const match = bcrypt.compareSync(password, user.password);

    if (!match) {
      return res.status(403).json({
        message: "Incorrect password",
      });
    }
    
    const token = await jwt.sign({ id: user.id }, process.env.SECRET);
    console.log(token)
    return res.json({
        message: "User logged in successfully!",
        token,
    
      });
    
  } catch (error) {
    throw new Error(error);
  }

  

  
};
