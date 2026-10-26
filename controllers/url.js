const { nanoid } = require("nanoid");
const urlmodel = require("../models/url");

function wantsJson(req) {
  return (
    req.originalUrl.startsWith("/api") ||
    req.headers.accept?.includes("application/json") ||
    req.headers["content-type"]?.includes("application/json")
  );
}

async function HandlegenerateNewUrl(req, res) {
  const body = req.body || {};

  if (!body.url) {
    return res.status(400).json({ error: "URL is required" });
  }

  const shortId = nanoid(8);

  await urlmodel.create({
    shortId,
    redirectURL: body.url,
    visitedHistory: [],
    createdBy: req.user._id,
  });

  if (wantsJson(req)) {
    return res.status(201).json({
      id: shortId,
      shortUrl: `http://localhost:1234/url/${shortId}`,
      redirectURL: body.url,
    });
  }

  return res.render("Home.ejs", {
    id: shortId,
  });
}

async function handlegetanalytics(req, res) {
  const shortId = req.params.shortId;
  const result = await urlmodel.findOne({ shortId });

  if (!result) {
    return res.status(404).json({ error: "Short URL not found" });
  }

  return res.json({
    totalclicks: result.visitedHistory.length,
    analytics: result.visitedHistory,
  });
}

module.exports = {
  HandlegenerateNewUrl,
  handlegetanalytics,
};
