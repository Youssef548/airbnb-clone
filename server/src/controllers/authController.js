// controllers/authController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function loginUser(req, res) {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    // Set session or token for authentication
    req.session.userId = user.id;
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
}

module.exports = { loginUser };
