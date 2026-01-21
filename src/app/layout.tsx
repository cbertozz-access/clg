import type { Metadata } from "next";
import { Lato, Roboto, Montserrat, Open_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { EnquiryCartProvider } from "@/lib/enquiry-cart";
import { VisitorDebugPanel } from "@/components/debug/VisitorDebugPanel";

// Access Hire Australia fonts
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

// Access Express fonts
const montserrat = Montserrat({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const openSans = Open_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Access Hire Australia | Equipment Hire & Sales",
  description: "Australia's leading elevated work platform and materials handling equipment hire company. Hire boom lifts, scissor lifts, forklifts, and more.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

// GTM Container ID
const GTM_ID = "GTM-NSDFMHP";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager - Head */}
        <Script id="gtm-init" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `}
        </Script>
      </head>
      <body
        className={`${lato.variable} ${roboto.variable} ${montserrat.variable} ${openSans.variable} antialiased`}
      >
        {/* Google Tag Manager - Noscript fallback */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <EnquiryCartProvider>
          {children}
          <VisitorDebugPanel />
        </EnquiryCartProvider>
        {/* CLG Visitor Tracking SDK - loads after GTM */}
        <Script
          src="/clg-visitor.js"
          strategy="afterInteractive"
        />
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
