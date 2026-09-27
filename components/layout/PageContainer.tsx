"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth/auth-context";

interface PageContainerProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  description,
  action,
  children,
}) => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="p-8 w-full flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-2 border-sienna border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 md:p-8 w-full max-w-none space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-mist">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink tracking-tight">{title}</h1>
          {description && <p className="text-sm text-slate mt-1">{description}</p>}
        </div>
        {action && <div className="flex items-center gap-3">{action}</div>}
      </div>

      {/* Main Content Area */}
      <div>{children}</div>
    </motion.div>
  );
};
