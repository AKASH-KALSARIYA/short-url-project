const express = require("express");
const url = require("../models/url");
const User = require("../models/user");
const { restrictTO } = require("../middlewares/auth");
const {
  HandlegenerateNewUrl,
  handlegetanalytics,
} = require("../controllers/url");
const {
  handleUSerSignUp,
  handleUSerLogin,
  handleLogout,
  handleMe,
} = require("../controllers/user");

const router = express.Router();

router.post("/signup", handleUSerSignUp);
router.post("/login", handleUSerLogin);
router.post("/logout", handleLogout);
router.get("/me", handleMe);

router.post("/url", restrictTO(["NORMAL", "ADMIN"]), HandlegenerateNewUrl);
router.get(
  "/url/analytics/:shortId",
  restrictTO(["NORMAL", "ADMIN"]),
  handlegetanalytics
);

router.get("/urls", restrictTO(["NORMAL", "ADMIN"]), async (req, res) => {
  const urls =
    req.user.role === "ADMIN"
      ? await url.find({})
      : await url.find({ createdBy: req.user._id });

  return res.json({ urls });
});

router.get("/admin/urls", restrictTO(["ADMIN"]), async (req, res) => {
  const urls = await url.find({});
  return res.json({ urls });
});

router.get("/admin/users", restrictTO(["ADMIN"]), async (req, res) => {
  const users = await User.find({}).select("-password");
  return res.json({ users });
});

module.exports = router;
