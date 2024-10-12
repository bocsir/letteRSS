"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHashedPw = getHashedPw;
exports.generateRefreshToken = generateRefreshToken;
exports.authenticateToken = authenticateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const utils_1 = require("./utils");
const JWT_SECRET = process.env.JWT_SECRET;
const saltRounds = 10;
function getHashedPw(password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield bcrypt_1.default.hash(password, saltRounds);
        }
        catch (err) {
            console.error("Error retrieving hashed password, ", err);
            throw err;
        }
    });
}
function generateRefreshToken(email) {
    return jsonwebtoken_1.default.sign({ email }, JWT_SECRET, { expiresIn: "30d" });
}
function authenticateToken(req, res, next) {
    const accessToken = (0, utils_1.getCookieValue)("accessToken", req);
    if (!accessToken) {
        console.log('no access token');
        //endpoint to refresh token then re-call the original endpoint call
        return res.sendStatus(401);
    }
    const refreshToken = (0, utils_1.getCookieValue)('refreshToken', req);
    if (!refreshToken) {
        console.log('no refresh token');
        return res.sendStatus(403);
    }
    jsonwebtoken_1.default.verify(accessToken, JWT_SECRET, (err, user) => {
        if (err)
            return res.sendStatus(403);
        req.user = user;
        next();
    });
}
