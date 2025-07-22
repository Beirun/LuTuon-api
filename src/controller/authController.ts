import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();



export const handleLogin = async (req: Request, res: Response): Promise<void> => {
    const { user, password } = req.body;

    // // const match = await bcrypt.compare(pwd, foundUser.password);
    // // if (match) {
    // //     const accessToken = jwt.sign(
    // //         { username: foundUser.username },
    // //         process.env.ACCESS_TOKEN_SECRET as string,
    // //         { expiresIn: '30s' }
    // //     );

    // //     const refreshToken = jwt.sign(
    // //         { username: foundUser.username },
    // //         process.env.REFRESH_TOKEN_SECRET as string,
    // //         { expiresIn: '1d' }
    // //     );

    // //     const otherUsers = usersDB.users.filter(person => person.username !== foundUser.username);
    // //     const currentUser = { ...foundUser, refreshToken };

    // //     usersDB.setUsers([...otherUsers, currentUser]);

    // //     await fs.writeFile(
    // //         path.join(__dirname, '..', 'model', 'users.json'),
    // //         JSON.stringify(usersDB.users)
    // //     );

    // //     res.cookie('jwt', refreshToken, {
    // //         httpOnly: true,
    // //         sameSite: 'None',
    // //         secure: true,
    // //         maxAge: 24 * 60 * 60 * 1000
    // //     });

    //     res.json({ accessToken });
    // } else {
    //     res.sendStatus(401);
    // }
};
