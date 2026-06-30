// Route Handler do Auth.js — expõe os endpoints internos (`/api/auth/*`).
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
