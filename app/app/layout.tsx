import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { appConfig } from "@/config/app";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { IBM_Plex_Mono, Lora, Plus_Jakarta_Sans } from "next/font/google";
import { cn } from "@/lib/utils";

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
          <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
