export type CreatePuppyState = {
  status: 'idle' | 'success' | 'error';
  fieldErrors?: Record<string, string[]>;
  formError?: string;
};

export const initialCreatePuppyState: CreatePuppyState = {
  status: 'idle',
};

export type UpdatePuppyState = {
  status: 'idle' | 'success' | 'error';
  fieldErrors?: Record<string, string[]>;
  formError?: string;
};

export const initialUpdatePuppyState: UpdatePuppyState = {
  status: 'idle',
};
