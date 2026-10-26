const express = require("express");
const url = require("../models/url");
const { restrictTO } = require("../middlewares/auth");
const User = require("../models/user");

const router = express.Router();

router.get("/admin/urls", restrictTO(["ADMIN"]), async (req, res) => {
  const allurls = await url.find({});
  return res.render("Home", {
    urls: allurls,
  });
});

router.get("/", restrictTO(["NORMAL", "ADMIN"]), async (req, res) => {
  const allurls = await url.find({ createdBy: req.user._id });

    // ✅ ADMIN: also fetch users
    if (req.user.role === "ADMIN") {
        const users = await User.find({});
        return res.render("Home", {
          urls: allurls,   // ✅ FIX: send allurls as urls
          users,           // ✅ send users
        });
      }

  return res.render("Home", {
    urls: allurls,
  });
});

router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.get("/login", (req, res) => {
  return res.render("login");
});

module.exports = router;
