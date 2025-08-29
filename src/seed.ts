import "dotenv/config";
import { db } from "./config/db";
import { role } from "./schema/role";
import { avatar } from "./schema/avatar";
import { v4 as uuidv4 } from "uuid";

async function seed() {
  try {
    // --- Seed Roles ---
    const roles = [
      { roleId: uuidv4(), roleName: "Admin" },
      { roleId: uuidv4(), roleName: "User" },
    ];

    await db.insert(role).values(roles);
    console.log("✅ Roles seeded");

    // --- Seed Avatars ---
    const avatars = [
      { avatarId: uuidv4(), avatarName: "Default Male", avatarPath: "/avatars/male.png" },
      { avatarId: uuidv4(), avatarName: "Default Female", avatarPath: "/avatars/female.png" },
      { avatarId: uuidv4(), avatarName: "Cool Guy", avatarPath: "/avatars/cool.png" },
      { avatarId: uuidv4(), avatarName: "Happy Girl", avatarPath: "/avatars/happy.png" },
    ];

    await db.insert(avatar).values(avatars);
    console.log("✅ Avatars seeded");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed", err);
    process.exit(1);
  }
}

seed();
