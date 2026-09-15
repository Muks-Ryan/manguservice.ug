import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export type AuthenticatedUser = {
	id: string;
	role: 'admin' | 'technician' | 'client';
	technicianId?: string;
};

declare global {
	namespace Express {
		interface Request {
			user?: AuthenticatedUser;
		}
	}
}

const getJwtSecret = (): string => {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error('JWT_SECRET is not configured.');
	}
	return secret;
};

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
	const token = req.cookies?.session;
	if (!token) {
		res.status(401).json({ error: 'Authentication required.' });
		return;
	}

	try {
		const payload = jwt.verify(token, getJwtSecret());
		if (typeof payload === 'string' || !payload.sub || !payload.role) {
			res.status(401).json({ error: 'Invalid session.' });
			return;
		}

		req.user = {
			id: payload.sub,
			role: payload.role as AuthenticatedUser['role'],
			technicianId: typeof payload.technicianId === 'string' ? payload.technicianId : undefined,
		};
		next();
	} catch {
		res.status(401).json({ error: 'Invalid or expired session.' });
	}
}

export function requireRole(...roles: AuthenticatedUser['role'][]) {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (!req.user || !roles.includes(req.user.role)) {
			res.status(403).json({ error: 'You do not have permission to perform this action.' });
			return;
		}
		next();
	};
}
