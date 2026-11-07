import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { CartDrawer } from "@/components/cart/CartDrawer";

export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">Saltar al contenido</a>
      <AnnouncementBar />
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <SearchOverlay />
      <CartDrawer />
    </>
  );
}
