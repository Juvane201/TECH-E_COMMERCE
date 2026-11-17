export interface Client {
  id: number;
  username: string;
  email: string;
  role: string;
  password?: string; // Optional, as it’s sensitive and may not be needed
}