export function adminAuth(req, res, next) {
  // ✅ Allow CORS preflight
  if (req.method === "OPTIONS") {
    return next();
  }

  const key = req.headers["x-admin-key"];

  if (!key || key !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}