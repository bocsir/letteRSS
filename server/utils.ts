import { Request } from "express";

export function getCookieValue(name: string, req: Request): string | undefined {
  if (req && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').map(cookie => cookie.trim());
    const targetCookie = cookies.find(cookie => cookie.startsWith(`${name}=`));
    if (targetCookie) {
      return targetCookie.split('=')[1];
    }
  }
  return undefined;
}

export function getUserId(req: Request): number {
  const userCookie = getCookieValue("user", req);
  if (userCookie) {
    const decodedValue = decodeURIComponent(userCookie);
    const parsedValue = JSON.parse(decodedValue);
    return parsedValue.id;
  }
  throw new Error("User ID not found in cookie");
}