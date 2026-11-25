import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { catalog } from "@/lib/providers";

export default async function TiendaLayout({ children }: { children: React.ReactNode }) {
  const categories = await catalog.listCategories().catch(() => []);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">Saltar al contenido</a>
      <AnnouncementBar />
      <Header categories={categories} />
      <main id="main">{children}</main>
      <Footer />
      <SearchOverlay />
      <CartDrawer />
    </>
  );
}
