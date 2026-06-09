import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClientOnly from "@/components/ClientOnly";

export const metadata = {
  title: "PhoneStore | Premium Mobile Store & Pre-Orders",
  description: "Experience the premium collection of smartphones from Apple, Samsung, Xiaomi, and more. Check review ratings, inventory stock, and purchase with secure payment processing.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          <CartProvider>
            <ClientOnly>
              <Navbar />
              <main style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                {children}
              </main>
              <Footer />
            </ClientOnly>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
