import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserInfo, AuthenticatedRequest } from "./types";
import { getCookieValue } from "./utils";

const JWT_SECRET: string = process.env.JWT_SECRET!;
const saltRounds: number = 10;

export async function getHashedPw(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (err) {
    console.error("Error retrieving hashed password, ", err);
    throw err;
  }
}

export function generateRefreshToken(email: string): string {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: "30d" });
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const accessToken = getCookieValue("accessToken", req);
  if (!accessToken) {
    console.log("no access token");
    //endpoint to refresh token then re-call the original endpoint call
    res.sendStatus(401);
    return;
  }

  const refreshToken = getCookieValue("refreshToken", req);
  if (!refreshToken) {
    console.log("no refresh token");
    res.sendStatus(403);
    return;
  }

  jwt.verify(accessToken, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user as UserInfo;
    next();
  });
}
