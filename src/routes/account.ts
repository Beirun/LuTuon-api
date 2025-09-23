// routes/account.ts
import { Router, Request, Response } from "express";
import { AccountController } from "../controllers/accountController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

router.post("/register", AccountController.register);
router.post("/login", AccountController.login);
router.post("/refresh", AccountController.refresh);
router.post("/logout", AccountController.logout);
router.post("/google", AccountController.google);


router.get("/token/verify", authenticateToken, async (req, res) => res.json());
router.get("/me", authenticateToken, AccountController.getMe);
router.get("/users", authenticateToken, AccountController.getAllUsers);
router.get("/users/:userId", authenticateToken, AccountController.getUserById);

router.put("/", authenticateToken, AccountController.update);

export default router;
