import { createUserService } from "../services/auth.service";

export async function seedUsers() {
  const user = {
    username: "youssef",
    email: "testtest@example.com",
    password: "Strong3Pass123#",
  };

  await createUserService(user.email, user.password, user.username);
}
