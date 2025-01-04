export interface IUser {
  userName: string;
  fullName: string;
  OauthId:string,
  email: string;
  role: string;
  avatar: string;
  refreshToken: string;
}

export interface AuthState {
  auth: boolean;
  user: IUser | null;
  loading: boolean;
  error: string | null;
}