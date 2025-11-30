import "dotenv/config";
import { db } from "./config/db";
import { avatar } from "./schema/avatar";
import { v4 as uuidv4 } from "uuid";

async function seed() {
  try {
    const names = [
      "knife",
      "halo-halo",
      "chopping-board",
      "eggplant",
      "garlic",
      "adobo",
      "fire",
      "pot",
      "chef-hat"
    ];

    const rows = names.map((n, i) => ({
      avatarId: uuidv4(),
      avatarName: n,
      avatarPath: `Profile ${i + 1}.png`
    }));

    await db.insert(avatar).values(rows);
    console.log("✅ Avatars seeded");

    process.exit(0);
  } catch (e) {
    console.error("❌ Seeding failed", e);
    process.exit(1);
  }
}

seed();
