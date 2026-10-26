const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieparser = require("cookie-parser");

const { connectToMonngoDB } = require("./connection");
const URL = require("./models/url");

const UrlRoute = require("./routes/url");
const staticRouter = require("./routes/staticRouter");
const userRoute = require("./routes/user");
const apiRouter = require("./routes/api");

const { checkforauthentication } = require("./middlewares/auth");

const app = express();
const PORT = 1234;

connectToMonngoDB("mongodb://localhost:27017/shorturl")
  .then(() => {
    console.log("mongodb connected!!");
  })
  .catch((err) => {
    console.error(err);
  });

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieparser());
app.use(checkforauthentication);

app.use("/api", apiRouter);

// Create + analytics are auth-protected inside the router; redirect below stays public
app.use("/url", UrlRoute);

// Public short-link redirect
app.get("/url/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    { shortId },
    {
      $push: {
        visitedHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );

  if (!entry) {
    return res.status(404).send("Short URL not found");
  }

  return res.redirect(entry.redirectURL);
});

app.use("/user", userRoute);
app.use("/", staticRouter);

app.get("/test", async (req, res) => {
  const allurls = await URL.find({});
  return res.render("Home.ejs", {
    urls: allurls,
  });
});

app.listen(PORT, () => {
  console.log(`server started at PORT:${PORT}`);
});
