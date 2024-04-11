// controllers/userController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createUser(req, res) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "please provide correct data" });
  }
  try {
    const newUser = await prisma.user.create({
      data: { username, email, password },
    });
    return res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
}

module.exports = { createUser };
