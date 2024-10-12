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
exports.setupDatabase = setupDatabase;
exports.getConnection = getConnection;
const mariadb_1 = __importDefault(require("mariadb"));
let connection = null;
const pool = mariadb_1.default.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.USER_PW,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || "3306", 10),
    connectionLimit: 5,
});
function setupDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            connection = yield pool.getConnection();
            console.log("Database connected successfully");
        }
        catch (err) {
            console.error("Error connecting to the database:", err);
        }
        finally {
            if (connection)
                connection.end(); // Release the connection back to the pool
        }
    });
}
function getConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!connection) {
            connection = yield pool.getConnection();
        }
        return connection;
    });
}
