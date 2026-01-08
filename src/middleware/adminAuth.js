export function adminAuth(req, res, next) {
  console.log("🔐 x-admin-key header:", req.headers["x-admin-key"]);
  console.log("🔐 ADMIN_API_KEY env:", process.env.ADMIN_API_KEY);
  
  const key = req.headers["x-admin-key"];

  if (!key || key !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}
