import { PrismaClient } from "@prisma/client";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),

    CredentialsProvider({
      name: "Credentials",
      id: "credentials",
      credentials: {
        correoElectronico: { label: "Correo electrónico", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.correoElectronico || !credentials?.password) {
          throw new Error("Correo y contraseña requeridos");
        }

        // Buscar usuario por correo (usa el campo de la BBDD)
        const user = await prisma.usuarios.findUnique({
          where: { correo_electronico: credentials.correoElectronico },
        });

        if (!user) {
          throw new Error("Correo electrónico no encontrado");
        }

        // Comparar contraseñas
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Contraseña incorrecta");
        }

        return {
          id: user.id.toString(),
          name: `${user.nombre} ${user.apellidos}`,
          email: user.correo_electronico,
          username: user.username,
          phone: user.telefono,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.username = user.username; // Añadir username
      }

      if (account?.provider === "google") {
        const dbUser = await prisma.usuarios.findUnique({
          where: { correo_electronico: token.email as string },
        });
        if (dbUser) {
          token.id = dbUser.id.toString();
          token.username = dbUser.username; // Añadir username
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user._id = token.id as string;
        session.user.username = token.username as string; // Añadir username
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.usuarios.findUnique({
          where: { correo_electronico: user.email as string },
        });

        if (!existingUser) {
          const newUser = await prisma.usuarios.create({
            data: {
              nombre: user.name?.split(" ")[0] ?? "",
              apellidos: user.name?.split(" ").slice(1).join(" ") ?? "",
              correo_electronico: user.email as string,
              password: await bcrypt.hash(Math.random().toString(36), 10),
              username: user.email?.split("@")[0] ?? "usuario",
            },
          });
          user.id = newUser.id.toString();
        } else {
          user.id = existingUser.id.toString();
        }
      }
      return true;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
