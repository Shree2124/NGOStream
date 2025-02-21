export interface IUser {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FetchedUser?: any | null;
  username: string;
}

export interface AuthState {
  auth: boolean;
  user: IUser | null;
  loading: boolean;
  error: string | null;
}