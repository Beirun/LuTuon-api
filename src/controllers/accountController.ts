//controllers/accountController.ts
import { Request, Response } from "express";
import { AccountService } from "../services/accountService";
import { AuthRequest } from "../middlewares/auth";
import { generateUsername } from "../config/username";
const accountService = new AccountService();

export class AccountController {
  static async register(req: Request, res: Response) {
    try {
      const result = await accountService.register({
        email: req.body.email,
        username: generateUsername(),
        password: req.body.password,
        dob: new Date("1/1/2000"),
      });
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const ip = req.ip || "unknown";
      const { token, user } = await accountService.login(
        req.body.email,
        req.body.password,
        ip,
        res
      );
      res.json({ message: "Login Successfully", token, user });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const ip = req.ip || "unknown";
      const { token } = await accountService.refresh(
        ip,
        req,
        res
      );
      res.json({ token });
    } catch (err: any) {
      res.status(401).json({ message: err.message });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      await accountService.logout(req,res);
      res.json({ message: "Logged out successfully" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const updates = req.body;

      const updatedUser = await accountService.update(userId, updates);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getMe(req: AuthRequest, res: Response) {
    try {
      const me = await accountService.getMe(req.user.userId);
      res.json(me);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  static async getAllUsers(_req: AuthRequest, res: Response) {
    try {
      const users = await accountService.getAllUsers();
      console.log("users",users)
      res.json(users);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  static async getUserById(req: AuthRequest, res: Response) {
    try {
      const user = await accountService.getUserById(req.params.userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
}
