import "./globals.css";

import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";

import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { ModeToggle } from "@/components/custom/ModeToggle";
import { ThemeProvider } from "@/components/theme-provider";
import { dark } from "@clerk/themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GitCodeBot",
  description: "Talk to Any Codebase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      baseTheme: dark,
    }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistMono.variable} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <header className="flex justify-end items-center p-4 gap-4 h-16">
              <SignedOut>
                <SignInButton />
                <SignUpButton>
                  <Button> Sign Up </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
              <ModeToggle />
            </header>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
