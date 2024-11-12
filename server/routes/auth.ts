import express from "express";
import { getConnection } from "../database";
import { getHashedPw, generateRefreshToken, authenticateToken } from "../auth";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AuthenticatedRequest } from "../types";
import { getCookieValue } from '../utils';

const router = express.Router();
const JWT_SECRET: string = process.env.JWT_SECRET!;

router.post("/signup", async (req, res) => {
  const connection = await getConnection();
  try {
    const hashedPw = await getHashedPw(req.body.password);
    const signupValues = [req.body.email.toLowerCase(), hashedPw];

    const query = "INSERT INTO user (email, password) VALUES (?, ?)";
    await connection.query(query, signupValues);
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Signup error: ", err);
    res.status(500).json({ error: "Error creating user" });
  }
});
  
router.post("/login", async (req, res) => {
  const connection = await getConnection();
  const query = "SELECT * FROM user WHERE email = ?";
  try {
    const queryRes = await connection.query(query, req.body.email);
    const hashedPw = queryRes[0].password;

    bcrypt.compare(req.body.password, hashedPw, async (err, passwordRes) => {
      //if password matches, make new access token and refresh token
      if (passwordRes) {
        const userId = queryRes[0].id;
        const email = queryRes[0].email;

        //make the tokens
        const accessToken = jwt.sign(
          { userId: userId, email: email },
          JWT_SECRET,
          { expiresIn: "1h" }
        );
        const refreshToken = generateRefreshToken(email);

        //send refresh token to DB
        await connection.query(
          "UPDATE user SET refresh_token = ? WHERE id = ?",
          [refreshToken, userId]
        );

        //store tokens in cookies
        res.cookie("accessToken", accessToken, {
          httpOnly: false,
          secure: false,
          sameSite: "strict",
          maxAge: 15 * 60 * 1000,
        });
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false,
          sameSite: "strict",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        //make a token for current user
        res.cookie("user", JSON.stringify({ id: userId, email: email }), {
          httpOnly: true,
          secure: false,
          sameSite: "strict",
          maxAge: 15 * 60 * 1000,
        });

        //successful response
        res.json({
          valid: passwordRes,
          queryFailed: false,
          accessToken: accessToken,
        });
      } else {
        //password didnt match, but query successful
        console.error("error logging in");
        res.json({ valid: false, queryFailed: false });
      }
    });
  } catch (err) {
    //email not found or server error happened
    console.error("login error: ", err);
    res.json({ valid: false, queryFailed: true });
  }
});

router.get("/auth", authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json({ authenticated: true, user: req.user });
});

router.post("/logout", (req, res) => {
  //clear all cookies
  res.setHeader(
    "Set-Cookie",
    [
      "accessToken=; HttpOnly=false; Secure=false; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
      "refreshToken=; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
      "user=; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1960 00:00:00 GMT"
    ]
  );
  res.status(200).json({ message: "logged out successfully" });
});

router.post("/refresh-token", async (req: any, res: any) => {
  const refreshToken = getCookieValue("refreshToken", req);
  if (!refreshToken) {return res.sendStatus(403);}
  try {
    const connection = await getConnection();
    const row = await connection.query(
      "SELECT * FROM user WHERE refresh_token = ?",
      [refreshToken]
    );
    if (!row) return res.sendStatus(403);
    const newAccessToken = jwt.sign(
      { userId: row[0].id, email: row[0].email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: false,
      secure: false,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("user", JSON.stringify({ id: row[0].id, email: row[0].email }), {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
    
    console.log('access token refreshed :)');
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return res.sendStatus(403);
  }
});

export default router;