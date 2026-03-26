import { Request , Response , NextFunction } from "express";

interface CustomRequest extends Request {
    user: {
        userId: string;
        role: string;
    };
}

export function authorizeRoles (...allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
       const customReq = req as CustomRequest;
        const user = customReq.user;


        if(!user || !allowedRoles.includes(user.role)) {
            return res.status(403).json({ message: `Access denied for role: ${user?.role || 'unknown'}` });
        }

        next();
    }
}