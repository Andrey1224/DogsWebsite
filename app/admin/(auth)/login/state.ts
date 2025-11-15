export type LoginState = {
  status: 'idle' | 'error';
  errors?: {
    login?: string[];
    password?: string[];
    form?: string[];
  };
};

export const initialLoginState: LoginState = {
  status: 'idle',
};
