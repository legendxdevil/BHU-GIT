import type { Metadata } from "next";
import "@/styles/globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/lib/auth/auth-context";
import { NotificationProvider } from "@/lib/realtime/notification-context";

export const metadata: Metadata = {
  title: "Bhu-Git — Version-Controlled Urban Land Records",
  description:
    "Automated Integration and Intelligent Harmonization of Multi-source Geospatial Data for Urban Land Record Management",
  applicationName: "Bhu-Git",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-paper text-ink min-h-screen antialiased">
        <AuthProvider>
          <ToastProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

