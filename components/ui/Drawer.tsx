"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

export function Drawer({ open, onOpenChange, title, side = "right", children }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; side?: "left" | "right"; children: React.ReactNode }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content aria-describedby={undefined} className={cn("fixed top-0 z-50 flex h-dvh w-[min(92vw,440px)] flex-col bg-white", side === "right" ? "right-0" : "left-0")}>
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <Dialog.Title className="label text-sm">{title}</Dialog.Title>
            <Dialog.Close className="label p-2" aria-label="Cerrar">✕</Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
