import { Noto_Sans_TC } from "next/font/google";
import { AppProviders } from "@/components/AppProviders";
import "./globals.css";
import "./type-tokens.css";
const noto = Noto_Sans_TC({
  variable: "--font-noto",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata = {
  title: {
    default: "Lazy Pets 專家",
    template: "%s · Lazy Pets",
  },
  description: "Lazy Pets 專家接單：寵物散步、寄宿、美容同維修任務。",
  icons: {
    icon: "/images/lazy-company-logo.png",
    apple: "/images/lazy-company-logo.png",
  },
};
export default function RootLayout({ children }) {
  return (<html lang="zh-Hant" className={`${noto.variable} h-full antialiased`}>
    <head>
      <link
        rel="preload"
        href="/fonts/Framework7Icons-Regular.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
    </head>
    <body className="min-h-full bg-[#f9fafc]">
      <AppProviders>{children}</AppProviders>
    </body>
  </html>);
}
