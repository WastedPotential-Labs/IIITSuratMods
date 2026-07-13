// Promotes (or demotes) a user account to the admin role.
//
// Usage, from the server/ folder:
//   npm run make:admin -- student@iiitsurat.ac.in
//   npm run make:admin -- student@iiitsurat.ac.in user   (demote back to user)
import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User.js";

const [email, role = "admin"] = process.argv.slice(2);

if (!email || !["admin", "user"].includes(role)) {
  console.error("Usage: npm run make:admin -- <email> [admin|user]");
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is missing in .env");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOneAndUpdate(
    { email: email.trim().toLowerCase() },
    { role },
    { new: true }
  );

  if (!user) {
    console.error(`No account found for ${email}. The user must sign up first.`);
    process.exit(1);
  }

  console.log(`${user.email} is now role "${user.role}".`);
} catch (error) {
  console.error("Failed to update role:", error.message);
  process.exit(1);
} finally {
  await mongoose.disconnect();
}
