'use server';

import { redirect } from "next/navigation";
import { z } from "zod";
import { setAdminSession } from "@/lib/admin/session";

export type LoginState = {
  status: "idle" | "error";
  errors?: {
    login?: string[];
    password?: string[];
    form?: string[];
  };
};

export const initialLoginState: LoginState = {
  status: "idle",
};

const loginSchema = z.object({
  login: z.string().min(1, "Login is required"),
  password: z.string().min(1, "Password is required"),
});

export async function authenticate(_: LoginState, formData: FormData): Promise<LoginState> {
  const submission = {
    login: formData.get("login"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(submission);
  if (!parsed.success) {
    return {
      status: "error",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { login, password } = parsed.data;
  const expectedLogin = process.env.ADMIN_LOGIN;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedLogin || !expectedPassword) {
    return {
      status: "error",
      errors: {
        form: ["Admin credentials are not configured. Set ADMIN_LOGIN and ADMIN_PASSWORD."],
      },
    };
  }

  if (login !== expectedLogin || password !== expectedPassword) {
    return {
      status: "error",
      errors: {
        form: ["Invalid login or password."],
      },
    };
  }

  await setAdminSession(login);
  redirect("/admin/puppies");
}
