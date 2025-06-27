// src/lib/auth/actions.ts
import {
	registerUser as registerUserAction,
	loginUser as loginUserAction,
} from '@/actions/auth';
import type {
	LoginCredentials,
	RegisterCredentials,
	AuthResult,
} from './types';

export const registerUserWithCredentials = async (
	credentials: RegisterCredentials,
): Promise<AuthResult> => {
	const formData = new FormData();
	formData.append('email', credentials.email);
	formData.append('password', credentials.password);
	formData.append('username', credentials.username);

	if (credentials.name) {
		formData.append('name', credentials.name);
	}

	return registerUserAction(formData);
};

export const loginUserWithCredentials = async (
	credentials: LoginCredentials,
): Promise<AuthResult> => {
	const formData = new FormData();
	formData.append('email', credentials.email);
	formData.append('password', credentials.password);

	return loginUserAction(formData);
};
