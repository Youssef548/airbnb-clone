
const { z } = require('zod')
const userSchema = z.object({
    username: z.string({required_error: "userName is required"}).min(3).max(20),
    email: z.string({required_error: "email is required"}).email(),
    password: z.string({required_error: "password is required"}).min(5,{required_error: "password should be greater than 5"}),
  },);
  

  const loginUserShema = z.object({
    email: z.string({required_error: "email is required"}).email(),
    password: z.string({required_error: "password is required"}).min(5,{required_error: "password should be greater than 5"}),
  })

module.exports = {userSchema,loginUserShema }