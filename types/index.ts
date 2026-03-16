export type AuthError = {
  [key: string]: string[] | string | undefined;
  name?: string[];
  email?: string[];
  password?: string[];
};

export type AuthState =
  | {
      message?: string;
      errors?: AuthError;
    }
  | null
  | undefined;

export interface UserSession {
  userId: number;
  email: string;
  name: string;
}

export interface JWTPayload extends UserSession {
  [key: string]: unknown;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}
