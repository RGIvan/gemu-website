import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      _id: string;
      id?: string;
      name: string;
      email: string;
      phone?: string | null;
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
  }
}
