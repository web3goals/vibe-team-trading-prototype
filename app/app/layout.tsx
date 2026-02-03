import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { UserProvider } from "@/components/providers/user-provider";
import { appConfig } from "@/config/app";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { IBM_Plex_Mono, Lora, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: {
    default: `${appConfig.title} - ${appConfig.description}`,
    template: `%s - ${appConfig.title}`,
  },
  description: appConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background antialiased",
          plusJakartaSans.variable,
          lora.variable,
          ibmPlexMono.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <QueryProvider>
            <UserProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1">{children}</div>
                <Footer />
                <Toaster />
              </div>
            </UserProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
