// services/logService.ts
import { db } from "../config/db"
import { log } from "../schema/log"
import { user } from "../schema/user"
import { desc, eq } from "drizzle-orm"

export class LogService {
  async getAllLogs() {
    return await db
      .select({
        logId: log.logId,
        logDescription: log.logDescription,
        logDate: log.logDate,
        userId: log.userId,
        userName: user.userName,
        userEmail: user.userEmail,
      })
      .from(log)
      .leftJoin(user, eq(user.userId,log.userId))
      .orderBy(desc(log.logDate))
  }
}
