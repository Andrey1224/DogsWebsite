export type CreatePuppyState = {
  status: 'idle' | 'success' | 'error';
  fieldErrors?: Record<string, string[]>;
  formError?: string;
};

export const initialCreatePuppyState: CreatePuppyState = {
  status: 'idle',
};
