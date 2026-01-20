import type { Metadata } from "next";
import { Lato, Roboto } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { EnquiryCartProvider } from "@/lib/enquiry-cart";
import { VisitorDebugPanel } from "@/components/debug/VisitorDebugPanel";

const lato = Lato({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
});

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Access Hire Australia | Equipment Hire & Sales",
  description: "Australia's leading elevated work platform and materials handling equipment hire company. Hire boom lifts, scissor lifts, forklifts, and more.",
};

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lato.variable} ${roboto.variable} antialiased`}
      >
        <EnquiryCartProvider>
          {children}
          <VisitorDebugPanel />
        </EnquiryCartProvider>
        {/* Builder.io Visual Editor Script */}
        <Script
          src="https://cdn.builder.io/js/webcomponents"
          strategy="afterInteractive"
        />
        <Script id="builder-init" strategy="afterInteractive">
          {`
            if (typeof Builder !== 'undefined') {
              Builder.init('${BUILDER_API_KEY}');
            }
          `}
        </Script>
      </body>
    </html>
  );
}
