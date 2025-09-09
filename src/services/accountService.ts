// services/accountService.ts
import { db } from "../config/db"
import { user } from "../schema/user"
import { refreshToken } from "../schema/refreshToken"
import { role } from "../schema/role"
import { eq, sql } from "drizzle-orm"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"
import { avatar } from "../schema/avatar"
import { Response, Request } from "express"
import { log } from "../schema/log"
import dotEnv from 'dotenv';

dotEnv.config();

const ACCESS_TOKEN_EXPIRY = "1h"
const REFRESH_TOKEN_EXPIRY_DAYS = 7

export class AccountService {
  private async addLog(userId: string, description: string) {
    await db.insert(log).values({
      logId: uuidv4(),
      userId,
      logDescription: description,
      logDate: new Date(),
    })
  }

  async register(data: {
    email: string
    username: string
    password: string
    dob: Date
    confirmPassword: string
  }) {
    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    if (!data.email || !data.password || !data.confirmPassword) throw new Error("Input all fields")
    
    if (!validateEmail(data.email)) throw new Error("Enter a valid email")
    
    if (data.password !== data.confirmPassword) throw new Error("Passwords do not match")
    
    if (data.password.length < 8) throw new Error("Password must be at least 8 characters long")
    
    const hashed = await bcryptjs.hash(data.password, 10)
    const randomAvatarId = await db.select().from(avatar).orderBy(sql`RANDOM()`).limit(1)

    const found = await db.select().from(user).where(eq(user.userEmail, data.email)).limit(1)
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
    await this.addLog(newUser.userId, "User registered")
    return { message: "Registered successfully" }
  }

  async login(email: string, password: string, ip: string, res: Response) {
    if (!email || !password) throw new Error("Input all fields")

    const found = await db.select().from(user).where(eq(user.userEmail, email)).limit(1)
    if (found.length === 0) throw new Error("Email not found")

    const valid = await bcryptjs.compare(password, found[0].passwordHash)
    if (!valid) throw new Error("Incorrect password")

    const payload = { userId: found[0].userId, roleId: found[0].roleId }
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: ACCESS_TOKEN_EXPIRY })

    const refreshTokenValue = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS)

    await db.insert(refreshToken).values({
      userId: found[0].userId,
      token: refreshTokenValue,
      ipAddress: ip,
      expiresAt,
    })

    const cookieOptions = {
      httpOnly: true,
      expires: expiresAt,
      // Fix the logic based on environment
      ...(process.env.NODE_ENV === "production" 
        ? { 
            secure: true, 
            sameSite: "none" as const,
            // Optional: set domain for production
            // domain: ".yourdomain.com" 
          }
        : { 
            secure: false, 
            sameSite: "lax" as const 
          }
      )
    }

    res.cookie("refreshToken", refreshTokenValue, cookieOptions)

    await this.addLog(found[0].userId, "User logged in")

    return {
      token,
      user: {
        userId: found[0].userId,
        userEmail: found[0].userEmail,
        userName: found[0].userName,
        userDob: found[0].userDob,
        avatarId: found[0].avatarId,
        roleId: found[0].roleId,
      },
    }
  }

  async google(email: string, username: string, ip: string, res: Response){
    let found = await db.select().from(user).where(eq(user.userEmail, email)).limit(1)
    let message = null;
    if (found.length === 0){
      const randomAvatarId = await db.select().from(avatar).orderBy(sql`RANDOM()`).limit(1)

      const newUser = {
        userId: uuidv4(),
        roleId: "30aa10d1-82fe-4738-aa13-c6dc27db9ca1",
        userEmail: email,
        userName: username,
        passwordHash: '',
        userDob: new Date('1/1/2000'),
        dateCreated: new Date(),
        dateUpdated: new Date(),
        avatarId: randomAvatarId[0].avatarId,
      }

      found = await db.insert(user).values(newUser).returning()
      await this.addLog(newUser.userId, "User registered")
      message = "Registered successfully"
    }


    const payload = { userId: found[0].userId, roleId: found[0].roleId }
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: ACCESS_TOKEN_EXPIRY })

    const refreshTokenValue = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS)

    await db.insert(refreshToken).values({
      userId: found[0].userId,
      token: refreshTokenValue,
      ipAddress: ip,
      expiresAt,
    })

    const cookieOptions = {
      httpOnly: true,
      expires: expiresAt,
      // Fix the logic based on environment
      ...(process.env.NODE_ENV === "production" 
        ? { 
            secure: true, 
            sameSite: "none" as const,
            // Optional: set domain for production
            // domain: ".yourdomain.com" 
          }
        : { 
            secure: false, 
            sameSite: "lax" as const 
          }
      )
    }

    res.cookie("refreshToken", refreshTokenValue, cookieOptions)

    console.log(refreshTokenValue)

    await this.addLog(found[0].userId, "User logged in")
    message = message ?? "Logged in successfully";
    return {
      message,
      token,
      user: {
        userId: found[0].userId,
        userEmail: found[0].userEmail,
        userName: found[0].userName,
        userDob: found[0].userDob,
        avatarId: found[0].avatarId,
        roleId: found[0].roleId,
      },
    }
  }

  async refresh(ip: string, req: Request, res: Response) {
    const oldToken = req.cookies.refreshToken
    console.log("old token", oldToken)
    if (!oldToken) throw new Error("No refresh token provided")

    const found = await db.select().from(refreshToken).where(eq(refreshToken.token, oldToken)).limit(1)
    if (found.length === 0) throw new Error("Invalid refresh token")

    const tokenRow = found[0]
    if (tokenRow.revokedAt || new Date(tokenRow.expiresAt) < new Date()) {
      throw new Error("Refresh token expired or revoked")
    }

    const payload = { userId: tokenRow.userId }
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: ACCESS_TOKEN_EXPIRY })

    await this.addLog(tokenRow.userId, "Access token refreshed")
    return { token }
  }

  async update(userId: string, updates: { userName?: string; userEmail?: string; oldPassword?: string; newPassword?: string; confirmPassword: string; userDob?: string; avatarId?: string }) {
    const dataToUpdate: any = {}
    const foundUser = await db.select().from(user).where(eq(user.userId,userId)).limit(1);
    if (foundUser.length === 0) throw new Error("User not found");
    if (updates.userName && updates.userName !== foundUser[0].userName) dataToUpdate.userName = updates.userName
    if (updates.userEmail && updates.userEmail !== foundUser[0].userEmail) 
    if (updates.avatarId && updates.avatarId !== foundUser[0].avatarId) dataToUpdate.avatarId = updates.avatarId
    if (updates.userDob && updates.userDob !== foundUser[0].userDob.toISOString()) dataToUpdate.userDob = new Date(updates.userDob)
    if (updates.newPassword) {
      if(updates.newPassword.length < 8) throw new Error("New Password must be atleast 8 characters long");
      if(updates.newPassword !== updates.confirmPassword) throw new Error("New password and confirm password do not match");
      if(foundUser[0].passwordHash && !updates.oldPassword) throw new Error("Please enter your old password");
      if(updates.oldPassword && !foundUser[0].passwordHash){
        const valid = await bcryptjs.compare(updates.oldPassword, foundUser[0].passwordHash);
        if(!valid) throw new Error("Incorrect Old Password");
      }
      dataToUpdate.passwordHash = await bcryptjs.hash(updates.newPassword, 10);
    }
    if(JSON.stringify(dataToUpdate) === '{}'){
      return {
        status: 200,
        message: "No changes have been made",
        user: {
          userId: foundUser[0].userId,
          userEmail: foundUser[0].userEmail,
          userName: foundUser[0].userName,
          userDob: foundUser[0].userDob,
          avatarId: foundUser[0].avatarId,
          roleId: foundUser[0].roleId,
        },
      }
    }
    
    dataToUpdate.dateUpdated = new Date() 
    if(dataToUpdate.userEmail){
      const found = await db.select().from(user).where(eq(user.userEmail, dataToUpdate.userEmail)).limit(1)
      if(found.length === 0) throw new Error("Email already taken")
      }
    const updatedUser = await db.update(user).set(dataToUpdate).where(eq(user.userId, userId)).returning()
    await this.addLog(userId, "User profile updated")
    return {
      status: 201,
      message: "Profile updated successfully",
        user: {
          userId: updatedUser[0].userId,
          userEmail: updatedUser[0].userEmail,
          userName: updatedUser[0].userName,
          userDob: updatedUser[0].userDob,
          avatarId: updatedUser[0].avatarId,
          roleId: updatedUser[0].roleId,
        },
    }
  }

  async logout(req: Request, res: Response) {
    const token = req.cookies.refreshToken
    console.log("token",req.cookies.refreshToken)
    if (token) {
      console.log('12')
      const user = await db.update(refreshToken).set({ revokedAt: new Date() }).where(eq(refreshToken.token, token)).returning()
      await this.addLog(user[0].userId, "User logged out")
    }
    console.log("123")

    res.clearCookie("refreshToken", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "none" })
    return { message: "Logged out successfully" }
  }

  async getMe(userId: string) {
    const result = await db.select().from(user).where(eq(user.userId, userId)).limit(1)
    return result[0]
  }

  async getAllUsers() {
return await db
    .select({
      userId: user.userId,
      userName: user.userName,
      userEmail: user.userEmail,
      userDob: user.userDob,
      roleName: role.roleName,
      dateCreated: user.dateCreated,

    })
    .from(user)
    .leftJoin(role, eq(user.roleId, role.roleId))  }

  async getUserById(id: string) {
    const result = await db.select().from(user).where(eq(user.userId, id)).limit(1)
    return result[0]
  }
}
