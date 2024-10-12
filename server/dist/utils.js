"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCookieValue = getCookieValue;
exports.getUserId = getUserId;
function getCookieValue(name, req) {
    if (req && req.headers.cookie) {
        const cookies = req.headers.cookie.split(';').map(cookie => cookie.trim());
        const targetCookie = cookies.find(cookie => cookie.startsWith(`${name}=`));
        if (targetCookie) {
            return targetCookie.split('=')[1];
        }
    }
    return undefined;
}
function getUserId(req) {
    const userCookie = getCookieValue("user", req);
    if (userCookie) {
        const decodedValue = decodeURIComponent(userCookie);
        const parsedValue = JSON.parse(decodedValue);
        return parsedValue.id;
    }
    throw new Error("User ID not found in cookie");
}
