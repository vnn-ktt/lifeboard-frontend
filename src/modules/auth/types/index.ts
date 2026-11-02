export type AuthProvider = 'email' | 'google' | 'github';

export interface AuthUserTemplate {
  avatarUrl: string | null;
  email: string;
  id: string;
  name: string | null;
  provider: AuthProvider;
}

export interface AuthSessionTemplate {
  accessToken: string;
  expiresAt: string;
  refreshToken: string | null;
  user: AuthUserTemplate;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues extends LoginFormValues {
  name: string;
  passwordConfirmation: string;
}

export type LoginPayload = LoginFormValues;
export type RegisterPayload = Omit<RegisterFormValues, 'passwordConfirmation'>;

export interface AuthState {
  errorMessage: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  session: AuthSessionTemplate | null;
}
