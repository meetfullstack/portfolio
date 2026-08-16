import { ViewTransitions } from "next-view-transitions";
import ThemeProvider from "@/components/ThemeProvider";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import LoadingScreen from "@/components/LoadingScreen";
import SmoothScroll from "@/components/SmoothScroll";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const title = "Meet Upadhyay — Full Stack Developer";
const description =
  "Full-stack developer specializing in React, Next.js, and agentic development workflows. Open to software engineering and Data/AI roles.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: `%s — ${SITE_NAME}`,
  },
  description,
  authors: [{ name: "Meet Upadhyay" }],
  keywords: [
    "Meet Upadhyay",
    "Full Stack Developer",
    "React",
    "Next.js",
    "TypeScript",
    "Software Engineer",
    "Toronto",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title,
    description,
    // Real dimensions of /profile.jpg (portrait, not the ideal 1200x630
    // OG landscape ratio) — a dedicated share image would render better on
    // social platforms, but this is at least accurate rather than a lie.
    images: [
      {
        url: "/profile.jpg",
        width: 1516,
        height: 1980,
        alt: "Meet Upadhyay — Full Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/profile.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#a855f7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Person",
                  "@id": `${SITE_URL}/#person`,
                  name: "Meet Upadhyay",
                  url: SITE_URL,
                  jobTitle: "Full Stack Developer",
                  email: "meetupadhyay158@gmail.com",
                  sameAs: [
                    "https://github.com/meetfullstack",
                    "https://www.linkedin.com/in/meetupadhy",
                  ],
                },
                {
                  "@type": "WebSite",
                  "@id": `${SITE_URL}/#website`,
                  url: SITE_URL,
                  name: title,
                  publisher: { "@id": `${SITE_URL}/#person` },
                },
              ],
            }),
          }}
        />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <ViewTransitions>
          <ThemeProvider>
            <SmoothScroll />
            <LoadingScreen />
            <Nav />
            <main id="main-content" className="page-content">
              {children}
            </main>
            <Footer />
            <ThemeToggle />
          </ThemeProvider>
        </ViewTransitions>
      </body>
    </html>
  );
}
