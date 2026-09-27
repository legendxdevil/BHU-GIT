import { UserRole } from "@/lib/constants";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  department?: string;
  assignedWard?: string;
  createdAt: number;
}
