"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole, USER_ROLES } from "@/lib/constants";
import { Permission, hasPermission } from "./permissions";
import { auth as firebaseAuth } from "@/lib/firebase/client";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

export interface DemoUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  department: string;
  assignedWard: string;
}

export const DEMO_USERS: Record<UserRole, DemoUser> = {
  [USER_ROLES.REVIEW_OFFICER]: {
    uid: "usr_reviewer_81",
    email: "reviewer@bhugit.gov.in",
    displayName: "Review Officer A",
    role: USER_ROLES.REVIEW_OFFICER,
    department: "Urban Land Revenue Authority",
    assignedWard: "Ward 12 (Central)",
  },
  [USER_ROLES.FIELD_OFFICER]: {
    uid: "usr_field_101",
    email: "field.officer@bhugit.gov.in",
    displayName: "Field Officer B",
    role: USER_ROLES.FIELD_OFFICER,
    department: "Geospatial Field Survey Wing",
    assignedWard: "Ward 12 (Central)",
  },
  [USER_ROLES.ADMIN]: {
    uid: "usr_admin_001",
    email: "admin@bhugit.gov.in",
    displayName: "System Administrator",
    role: USER_ROLES.ADMIN,
    department: "IT & Cadastral Operations",
    assignedWard: "All Wards",
  },
  [USER_ROLES.VIEWER]: {
    uid: "usr_viewer_99",
    email: "viewer@bhugit.gov.in",
    displayName: "Public / Citizen Viewer",
    role: USER_ROLES.VIEWER,
    department: "Public Information Portal",
    assignedWard: "Ward 12 (Central)",
  },
};

interface AuthContextType {
  user: DemoUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithRole: (selectedRole: UserRole) => Promise<void>;
  loginWithCredentials: (email: string, pass: string, selectedRole: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  can: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "bhugit_active_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DemoUser | null>(DEMO_USERS[USER_ROLES.REVIEW_OFFICER]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load persisted user session from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch (e) {
      console.warn("Could not parse saved auth session:", e);
    } finally {
      setIsLoading(false);
    }

    // Subscribe to Firebase Auth if live keys exist
    if (firebaseAuth && firebaseAuth.app?.options?.apiKey !== "mock-api-key") {
      const unsubscribe = onAuthStateChanged(firebaseAuth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          let savedRole = USER_ROLES.REVIEW_OFFICER;
          try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
              const parsed = JSON.parse(stored);
              if (parsed.role) savedRole = parsed.role;
            }
          } catch (e) {}

          const userObj: DemoUser = {
            uid: fbUser.uid,
            email: fbUser.email || "user@bhugit.gov.in",
            displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Authenticated Officer",
            role: savedRole,
            department: "Urban Land Revenue Authority",
            assignedWard: "Ward 12 (Central)",
          };
          setUser(userObj);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(userObj));
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const loginWithRole = async (selectedRole: UserRole) => {
    setIsLoading(true);
    const demoUser = DEMO_USERS[selectedRole] || DEMO_USERS[USER_ROLES.REVIEW_OFFICER];
    setUser(demoUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
    setIsLoading(false);
  };

  const loginWithCredentials = async (email: string, pass: string, selectedRole: UserRole) => {
    setIsLoading(true);

    if (firebaseAuth && firebaseAuth.app?.options?.apiKey !== "mock-api-key") {
      try {
        await signInWithEmailAndPassword(firebaseAuth, email, pass);
      } catch (err: any) {
        console.warn("Firebase signInWithEmailAndPassword note:", err?.code || err?.message);
        
        // If user account does not exist in live Firebase project yet, attempt auto-registration
        if (
          err.code === "auth/invalid-credential" ||
          err.code === "auth/user-not-found" ||
          err.code === "auth/wrong-password"
        ) {
          try {
            await createUserWithEmailAndPassword(firebaseAuth, email, pass);
          } catch (createErr: any) {
            console.warn(
              "Firebase createUserWithEmailAndPassword note (falling back to persona session):",
              createErr?.code || createErr?.message
            );
          }
        } else {
          console.warn("Firebase auth note, proceeding with persona session:", err?.message);
        }
      }
    }

    // Assign specified role persona session
    const userObj: DemoUser = {
      uid: firebaseAuth?.currentUser?.uid || `usr_${Date.now()}`,
      email,
      displayName: email.split("@")[0].replace(".", " "),
      role: selectedRole,
      department: "Urban Land Revenue Authority",
      assignedWard: "Ward 12 (Central)",
    };

    setUser(userObj);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userObj));
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    if (firebaseAuth && firebaseAuth.app?.options?.apiKey !== "mock-api-key") {
      try {
        await firebaseSignOut(firebaseAuth);
      } catch (err) {
        console.warn("Error signing out of Firebase:", err);
      }
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    setIsLoading(false);
  };

  const currentRole = user ? user.role : USER_ROLES.VIEWER;

  const can = (permission: Permission): boolean => {
    return hasPermission(currentRole, permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: currentRole,
        isAuthenticated: !!user,
        isLoading,
        loginWithRole,
        loginWithCredentials,
        logout,
        can,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
