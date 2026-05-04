import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import ErrorBoundary from "../components/ErrorBoundary";
import CartDrawerWrapper from "../components/CartDrawerWrapper";
import SmoothScroll from "../components/SmoothScroll";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Valhalla Suite | Restaurant Intelligence",
  description: "Where fire meets saffron. The system behind the spectacle — manage, orchestrate, deliver.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} antialiased`}>
        <ErrorBoundary>
          <CartProvider>
            <SmoothScroll>
              {children}
            </SmoothScroll>
            <CartDrawerWrapper />
          </CartProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
