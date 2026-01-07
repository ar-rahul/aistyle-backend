export function adminAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing admin token" });
  }

  const token = header.replace("Bearer ", "").trim();

  if (token !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ error: "Invalid admin token" });
  }

  next();
}
