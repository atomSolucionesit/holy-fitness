"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UI { menuOpen: boolean; searchOpen: boolean; setMenu: (o: boolean) => void; setSearch: (o: boolean) => void; wishlist: string[]; toggleWish: (slug: string) => void }
export const useUI = create<UI>()(persist((set) => ({
  menuOpen: false, searchOpen: false, wishlist: [],
  setMenu: (menuOpen) => set({ menuOpen }), setSearch: (searchOpen) => set({ searchOpen }),
  toggleWish: (slug) => set((s) => ({ wishlist: s.wishlist.includes(slug) ? s.wishlist.filter((x) => x !== slug) : [...s.wishlist, slug] })),
}), { name: "hf-ui", partialize: (s) => ({ wishlist: s.wishlist }) }));
