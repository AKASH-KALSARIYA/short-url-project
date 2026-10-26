const User = require("../models/user");
const { setUser } = require("../Service/auth");

function wantsJson(req) {
  return (
    req.originalUrl.startsWith("/api") ||
    req.headers.accept?.includes("application/json") ||
    req.headers["content-type"]?.includes("application/json")
  );
}

async function handleUSerSignUp(req, res) {
  const { name, email, password } = req.body;

  if (!email) {
    if (wantsJson(req)) {
      return res.status(400).json({ error: "Email is required" });
    }
    return res.status(400).send("Email is required");
  }

  if (!name || !password) {
    if (wantsJson(req)) {
      return res.status(400).json({ error: "Name and password are required" });
    }
    return res.status(400).send("Name and password are required");
  }

  try {
    await User.create({ name, email, password });
  } catch (err) {
    if (wantsJson(req)) {
      return res.status(400).json({ error: "Could not create user. Email may already exist." });
    }
    return res.status(400).send("Could not create user");
  }

  if (wantsJson(req)) {
    return res.status(201).json({ message: "Signup successful. Please login." });
  }
  return res.redirect("/login");
}

async function handleUSerLogin(req, res) {
  const { email, password } = req.body;
  const foundUser = await User.findOne({ email });

  if (!foundUser || foundUser.password !== password) {
    if (wantsJson(req)) {
      return res.status(401).json({ error: "INVALID USERNAME OR PASSWORD" });
    }
    return res.render("login", {
      error: "INVALID USERNAME OR PASSWORD",
    });
  }

  const token = setUser(foundUser);
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
  });

  if (wantsJson(req)) {
    return res.json({
      message: "Login successful",
      user: {
        _id: foundUser._id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
      },
    });
  }
  return res.redirect("/");
}

function handleLogout(req, res) {
  res.clearCookie("token");
  if (wantsJson(req)) {
    return res.json({ message: "Logged out" });
  }
  return res.redirect("/login");
}

function handleMe(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  return res.json({
    user: {
      _id: req.user._id,
      email: req.user.email,
      role: req.user.role,
    },
  });
}

module.exports = {
  handleUSerSignUp,
  handleUSerLogin,
  handleLogout,
  handleMe,
};
