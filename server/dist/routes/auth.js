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
const express_1 = __importDefault(require("express"));
const database_1 = require("../database");
const auth_1 = require("../auth");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const utils_1 = require("../utils");
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET;
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield (0, database_1.getConnection)();
    try {
        const hashedPw = yield (0, auth_1.getHashedPw)(req.body.password);
        const signupValues = [req.body.email, hashedPw];
        const query = "INSERT INTO user (email, password) VALUES (?, ?)";
        yield connection.query(query, signupValues);
        res.status(201).json({ message: "User created successfully" });
    }
    catch (err) {
        console.error("Signup error: ", err);
        res.status(500).json({ error: "Error creating user" });
    }
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield (0, database_1.getConnection)();
    const query = "SELECT * FROM user WHERE email = ?";
    try {
        const queryRes = yield connection.query(query, req.body.email);
        const hashedPw = queryRes[0].password;
        bcrypt_1.default.compare(req.body.password, hashedPw, (err, passwordRes) => __awaiter(void 0, void 0, void 0, function* () {
            //if password matches, make new access token and refresh token
            if (passwordRes) {
                const userId = queryRes[0].id;
                const email = queryRes[0].email;
                //make the tokens
                const accessToken = jsonwebtoken_1.default.sign({ userId: userId, email: email }, JWT_SECRET, { expiresIn: "1h" });
                const refreshToken = (0, auth_1.generateRefreshToken)(email);
                //send refresh token to DB
                yield connection.query("UPDATE user SET refresh_token = ? WHERE id = ?", [refreshToken, userId]);
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
            }
            else {
                //password didnt match, but query successful
                console.error("error logging in");
                res.json({ valid: false, queryFailed: false });
            }
        }));
    }
    catch (err) {
        //email not found or server error happened
        console.error(err);
        res.json({ valid: false, queryFailed: true });
    }
}));
router.get("/auth", auth_1.authenticateToken, (req, res) => {
    res.json({ authenticated: true, user: req.user });
});
router.post("/logout", (req, res) => {
    //clear all cookies
    res.setHeader("Set-Cookie", [
        "accessToken=; HttpOnly=false; Secure=false; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
        "refreshToken=; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
        "user=; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1960 00:00:00 GMT"
    ]);
    res.status(200).json({ message: "logged out successfully" });
});
router.post("/refresh-token", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = (0, utils_1.getCookieValue)("refreshToken", req);
    if (!refreshToken) {
        return res.sendStatus(403);
    }
    try {
        const connection = yield (0, database_1.getConnection)();
        const row = yield connection.query("SELECT * FROM user WHERE refresh_token = ?", [refreshToken]);
        if (!row)
            return res.sendStatus(403);
        const newAccessToken = jsonwebtoken_1.default.sign({ userId: row[0].id, email: row[0].email }, JWT_SECRET, { expiresIn: "1h" });
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
    }
    catch (err) {
        console.error(err);
        return res.sendStatus(403);
    }
}));
exports.default = router;
