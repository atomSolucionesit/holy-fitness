import Image from "next/image";
export function Logo({ tone = "black", className = "h-11" }: { tone?: "black" | "white"; className?: string }) {
  return <Image src={tone === "white" ? "/logo-white.png" : "/logo-black.png"} alt="Holy Fitness" width={783} height={393} priority className={`${className} w-auto`} />;
}
