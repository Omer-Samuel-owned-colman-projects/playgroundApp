import { Response, NextFunction } from "express";
import { verifyAccessToken, AuthRequest } from "../services/authServices";

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    req.user = { _id: decoded.userId };
    next();
};

export default authMiddleware;