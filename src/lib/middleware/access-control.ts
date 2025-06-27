// src/lib/middleware/access-control.ts
import { NextRequest } from 'next/server';
import { checkAccess } from '@/lib/edge-config';
import { getClientIP } from './rate-limits';

export interface AccessResult {
	isAllowed: boolean;
	reason?: string;
	isMaintenanceMode?: boolean;
	isIPBlocked?: boolean;
	isUserBanned?: boolean;
}

export const checkIPAccess = async (
	request: NextRequest,
): Promise<AccessResult> => {
	try {
		const ip = getClientIP(request);
		const { isMaintenanceMode, isIPBlocked } = await checkAccess(ip);

		if (isMaintenanceMode) {
			return {
				isAllowed: false,
				reason: 'Service temporarily unavailable',
				isMaintenanceMode: true,
			};
		}

		if (isIPBlocked) {
			return {
				isAllowed: false,
				reason: 'Access denied',
				isIPBlocked: true,
			};
		}

		return { isAllowed: true };
	} catch (error) {
		console.error('IP access check failed:', error);

		return { isAllowed: true };
	}
};

export const checkUserAccess = async (
	request: NextRequest,
	userId: string,
): Promise<AccessResult> => {
	try {
		const ip = getClientIP(request);
		const userAccess = await checkAccess(ip, userId);

		if (userAccess.isUserBanned) {
			return {
				isAllowed: false,
				reason: 'User access revoked',
				isUserBanned: true,
			};
		}

		return { isAllowed: true };
	} catch (error) {
		console.error('User access check failed:', error);

		return { isAllowed: true };
	}
};

export const checkFullAccess = async (
	request: NextRequest,
	userId?: string,
): Promise<AccessResult> => {
	const ipAccess = await checkIPAccess(request);

	if (!ipAccess.isAllowed) {
		return ipAccess;
	}

	if (userId) {
		const userAccess = await checkUserAccess(request, userId);

		if (!userAccess.isAllowed) {
			return userAccess;
		}
	}

	return { isAllowed: true };
};
