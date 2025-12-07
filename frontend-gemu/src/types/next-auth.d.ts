import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    username?: string;
    phone?: string | null;
  }

  interface Session {
    user: {
      _id: string;
      id?: string;
      name: string;
      email: string;
      phone?: string | null;
      username?: string;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    username?: string;
  }
}
