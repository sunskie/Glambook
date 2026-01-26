export interface AuthUser {
  id: string;
  role: "client" | "vendor" | "admin";
}
