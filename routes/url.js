const express = require("express");
const {
  HandlegenerateNewUrl,
  handlegetanalytics,
} = require("../controllers/url");
const { restrictTO } = require("../middlewares/auth");

const router = express.Router();

router.post("/", restrictTO(["NORMAL", "ADMIN"]), HandlegenerateNewUrl);
router.get(
  "/analytics/:shortId",
  restrictTO(["NORMAL", "ADMIN"]),
  handlegetanalytics
);

module.exports = router;
