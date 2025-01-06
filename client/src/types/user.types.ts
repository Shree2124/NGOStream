export interface IUser {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FetchedUser?: any | null;
  username: string;
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