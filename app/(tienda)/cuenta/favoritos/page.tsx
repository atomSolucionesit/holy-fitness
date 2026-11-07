import { WishlistPage } from "@/components/product/WishlistPage";
export const metadata = { title: "Favoritos", robots: { index: false } };
export default function Page() { return <div className="mx-auto max-w-[1600px] px-4 py-8 lg:px-8"><h1 className="display h-section mb-8">Favoritos</h1><WishlistPage /></div>; }
