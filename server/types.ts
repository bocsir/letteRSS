import { Request } from "express";

export interface UserInfo {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserInfo;
}