import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Warm leads Sourcer - Turn Social Engagement Into Warm Leads Instantly",
  description: "Extract and enrich engagement data from public social posts to generate warm leads instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <SidebarProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    borderRadius: '12px',
                    background: '#fff',
                    color: '#374151',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e5e7eb',
                    fontSize: '14px',
                    fontWeight: '500',
                  },
                  success: {
                    style: {
                      background: '#f0fdf4',
                      color: '#166534',
                      border: '1px solid #bbf7d0',
                    },
                    iconTheme: {
                      primary: '#16a34a',
                      secondary: '#f0fdf4',
                    },
                  },
                  error: {
                    style: {
                      background: '#fef2f2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                    },
                    iconTheme: {
                      primary: '#dc2626',
                      secondary: '#fef2f2',
                    },
                  },
                  loading: {
                    style: {
                      background: '#fefbf3',
                      color: '#d97706',
                      border: '1px solid #fed7aa',
                    },
                    iconTheme: {
                      primary: '#d97706',
                      secondary: '#fefbf3',
                    },
                  },
                }}
              />
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
