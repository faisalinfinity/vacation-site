// /middleware/auth.ts
import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: string;
  email: string;
}

export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
}
