const { getUser } = require("../Service/auth");

function wantsJson(req) {
  return (
    req.originalUrl.startsWith("/api") ||
    req.headers.accept?.includes("application/json")
  );
}

function checkforauthentication(req, res, next) {
  const tokencookie = req.cookies?.token;
  req.user = null;
  if (!tokencookie) return next();

  const user = getUser(tokencookie);
  req.user = user;
  return next();
}

function restrictTO(roles = []) {
  return function (req, res, next) {
    if (!req.user) {
      if (wantsJson(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      return res.redirect("/login");
    }
    if (!roles.includes(req.user.role)) {
      if (wantsJson(req)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      return res.end("Unauthorized");
    }
    return next();
  };
}

module.exports = {
  checkforauthentication,
  restrictTO,
};
