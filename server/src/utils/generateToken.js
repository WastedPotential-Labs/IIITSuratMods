//all the code+comments written are cross verified with the documentation ; if u have any suggestions for improvement please let me know :)


import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  // JWT_SECRET is the private key used to sign tokens.
  // The frontend receives the token, but it should never receive JWT_SECRET.
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in .env");
  }

  // jwt.sign creates a token that stores the user's database id.
  // Later, auth middleware reads this id to know which user is logged in.
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d"
  });
};

export default generateToken;
