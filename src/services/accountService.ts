import { db } from "../config/db"
import { user } from "../schema/user"
import { refreshToken } from "../schema/refreshToken"
import { eq, sql } from "drizzle-orm"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"
import { avatar } from "../schema/avatar"
import { Response } from "express"

const ACCESS_TOKEN_EXPIRY = "1h"
const REFRESH_TOKEN_EXPIRY_DAYS = 7

export class AccountService {
  async register(data: {
    email: string
    username: string
    password: string
    dob: Date
  }) {
    const hashed = await bcryptjs.hash(data.password, 10)

    const randomAvatarId = await db
      .select()
      .from(avatar)
      .orderBy(sql`RANDOM()`)
      .limit(1)

    const found = await db
      .select()
      .from(user)
      .where(eq(user.userEmail, data.email))
      .limit(1)

    if (found.length !== 0) throw new Error("Email is already taken")

    const newUser = {
      userId: uuidv4(),
      roleId: "30aa10d1-82fe-4738-aa13-c6dc27db9ca1",
      userEmail: data.email,
      userName: data.username,
      passwordHash: hashed,
      userDob: data.dob,
      dateCreated: new Date(),
      dateUpdated: new Date(),
      avatarId: randomAvatarId[0].avatarId,
    }

    await db.insert(user).values(newUser)
    return { message: "Registered successfully" }
  }

  async login(email: string, password: string, ip: string, res: Response) {
    const found = await db
      .select()
      .from(user)
      .where(eq(user.userEmail, email))
      .limit(1)

    if (found.length === 0) throw new Error("Email not found")

    const valid = await bcryptjs.compare(password, found[0].passwordHash)
    if (!valid) throw new Error("Incorrect password")

    const payload = { userId: found[0].userId, roleId: found[0].roleId }

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    })

    const refreshTokenValue = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS)
    // expiresAt.setMinutes(expiresAt.getMinutes() + 1)  //For testing only

    await db.insert(refreshToken).values({
      userId: found[0].userId,
      token: refreshTokenValue,
      ipAddress: ip,
      expiresAt,
    })

    // set refresh token in secure, httpOnly cookie
    res.cookie("refreshToken", refreshTokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: expiresAt,
    })

    return {
      token,
      user: {
        userId: found[0].userId,
        userEmail: found[0].userEmail,
        userName: found[0].userName,
        userDob: found[0].userDob,
        avatarId: found[0].avatarId,
        isAdmin: found[0].roleId !== "30aa10d1-82fe-4738-aa13-c6dc27db9ca1",
      },
    }
  }

  async refresh(ip: string, req: any, res: Response) {
    const oldToken = req.cookies.refreshToken
    if (!oldToken) throw new Error("No refresh token provided")

    const found = await db
      .select()
      .from(refreshToken)
      .where(eq(refreshToken.token, oldToken))
      .limit(1)

    if (found.length === 0) throw new Error("Invalid refresh token")
    const tokenRow = found[0]

    if (tokenRow.revokedAt || new Date(tokenRow.expiresAt) < new Date()) {
      throw new Error("Refresh token expired or revoked")
    }

    const payload = { userId: tokenRow.userId }
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    })

    return { token }
  }

  async update(
    userId: string,
    updates: {
      userName?: string
      userEmail?: string
      password?: string
      userDob?: Date
      avatarId?: string
    }
  ) {
    const dataToUpdate: any = { dateUpdated: new Date() }

    if (updates.userName) dataToUpdate.userName = updates.userName
    if (updates.userEmail) dataToUpdate.userEmail = updates.userEmail
    if (updates.avatarId) dataToUpdate.avatarId = updates.avatarId
    if (updates.userDob) dataToUpdate.userDob = updates.userDob
    if (updates.password) {
      dataToUpdate.passwordHash = await bcryptjs.hash(updates.password, 10)
    }

    const updatedUser = await db
      .update(user)
      .set(dataToUpdate)
      .where(eq(user.userId, userId))
      .returning()

    return updatedUser[0]
  }

  async logout(req: any, res: Response) {
    const token = req.cookies.refreshToken
    if (token) {
      await db
        .update(refreshToken)
        .set({ revokedAt: new Date() })
        .where(eq(refreshToken.token, token))
    }

    // clear refresh cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })

    return { message: "Logged out successfully" }
  }

  async getMe(userId: string) {
    const result = await db
      .select()
      .from(user)
      .where(eq(user.userId, userId))
      .limit(1)
    return result[0]
  }

  async getAllUsers() {
    return await db.select().from(user)
  }

  async getUserById(id: string) {
    const result = await db
      .select()
      .from(user)
      .where(eq(user.userId, id))
      .limit(1)
    return result[0]
  }
}
