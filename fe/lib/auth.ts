import Credentials from "next-auth/providers/credentials";

import { User as UserType, user } from "@/app/api/user/data";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
    }),
    GithubProvider({
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "NID / Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        // 1. Try Go backend first (support /api/auth/login or /api/v1/auth/login)
        try {
          const res = await fetch("http://127.0.0.1:8080/api/v1/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              identifier: email,
              username: email,
              nid: email,
              email: email,
              password: password,
            }),
          });
          const data = await res.json();
          const isSuccess = data?.status === true || data?.success === true;
          const token = data?.data?.token || data?.token;
          if (data && isSuccess && data.data?.user) {
            return {
              id: data.data.user.id,
              name: data.data.user.name,
              email: data.data.user.email || `${email}@interlogs.pln.co.id`,
              image: data.data.user.user_image || "/logo.png",
              token: token,
              role: data.data.user.role?.code || "ADMIN",
              user: data.data.user,
            } as any;
          }
        } catch (e) {
          // Backend may be starting or offline
        }

        // 2. Fallback check for default role accounts (works even if backend is starting)
        const demoAccounts: Record<string, { name: string; role: string; roleName: string }> = {
          admin: { name: "Administrator Sistem", role: "ADMIN", roleName: "Administrator" },
          gm: { name: "Budi Santoso (General Manager)", role: "GM", roleName: "General Manager" },
          mgr_user: { name: "Hendra Wijaya (Manager Pemeliharaan)", role: "MGR_USER", roleName: "Manager User" },
          spv_user: { name: "Rizky Pratama (Supervisor Rendal Har)", role: "SPV_USER", roleName: "Supervisor User" },
          staff_user: { name: "Dimas Anggara (Staff Enjiniring)", role: "STAFF_USER", roleName: "Staff User" },
          mgr_logistik: { name: "Agus Setiawan (Manager Logistik)", role: "MGR_LOGISTIK", roleName: "Manager Logistik" },
          spv_inventory: { name: "Fajar Nugroho (Supervisor Inventory Control)", role: "SPV_INVENTORY", roleName: "Supervisor Inventory" },
          staff_inventory: { name: "Ilham Ramadhan (Staff Kataloger)", role: "STAFF_INVENTORY", roleName: "Staff Inventory" },
          spv_pengadaan: { name: "Bambang Haryanto (Supervisor Pengadaan)", role: "SPV_PENGADAAN", roleName: "Supervisor Pengadaan" },
          staff_pengadaan: { name: "Siti Rahmawati (Buyer / Staff Pengadaan)", role: "STAFF_PENGADAAN", roleName: "Staff Pengadaan" },
          spv_gudang: { name: "Eko Prasetyo (Supervisor Gudang)", role: "SPV_GUDANG", roleName: "Supervisor Gudang" },
          staff_gudang: { name: "Joko Susilo (Staff Gudang)", role: "STAFF_GUDANG", roleName: "Staff Gudang" },
          mgr_keuangan: { name: "Sri Wahyuni (Manager Keuangan)", role: "MGR_KEUANGAN", roleName: "Manager Keuangan" },
          spv_keuangan: { name: "Rina Agustina (Supervisor Keuangan)", role: "SPV_KEUANGAN", roleName: "Supervisor Keuangan" },
          staff_keuangan: { name: "Bayu Kurniawan (Staff Keuangan)", role: "STAFF_KEUANGAN", roleName: "Staff Keuangan" },
        };

        const accountKey = email.toLowerCase().replace("@interlogs.pln.co.id", "");
        const matched = demoAccounts[accountKey];
        if (matched && (password === "Password123!" || password === accountKey || password === "password" || password === "admin")) {
          return {
            id: `usr-${accountKey}`,
            name: matched.name,
            email: `${accountKey}@interlogs.pln.co.id`,
            image: "/logo.png",
            role: matched.role,
            user: {
              id: `usr-${accountKey}`,
              nid: accountKey,
              name: matched.name,
              email: `${accountKey}@interlogs.pln.co.id`,
              user_type: matched.role === "ADMIN" ? "ADMIN" : "USER",
              role: {
                code: matched.role,
                name: matched.roleName,
              },
            },
          } as any;
        }

        // 3. Fallback mock user check
        const foundUser = user.find((u) => u.email === email);
        if (foundUser && password === foundUser.password) {
          return foundUser as any;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.token = user.token;
        token.role = user.role;
        token.userData = user.user;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.token = token.token;
        session.user.role = token.role;
        session.user.userData = token.userData;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "44701d4cea71dda7a51cf998408533d1",
  pages: {
    signIn: "/auth/login",
  },

  session: {
    strategy: "jwt",
  },
  debug: false,
};
