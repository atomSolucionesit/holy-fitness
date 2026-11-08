import { Button, Img } from "@/components/ui";
export function Hero({ title, sub, image, position = "50% 50%", cta1, cta2, priority }: { title: string; sub: string; image: string; position?: string; cta1: [string, string]; cta2?: [string, string]; priority?: boolean }) {
  return (
    <section className="relative isolate flex min-h-[78vh] items-end overflow-hidden bg-ink text-white">
      <Img src={image} alt="" priority={priority} className="-z-10" style={{ objectPosition: position }} />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="mx-auto w-full max-w-[1600px] px-4 pb-12 lg:px-8 lg:pb-20">
        <h1 className="display h-hero max-w-5xl">{title}</h1>
        <p className="mt-4 max-w-md text-base">{sub}</p>
        <div className="mt-6 flex flex-wrap gap-3"><Button variant="light" href={cta1[1]}>{cta1[0]}</Button>{cta2 && <Button variant="outline" href={cta2[1]} className="border-white text-white hover:bg-white hover:text-ink">{cta2[0]}</Button>}</div>
      </div>
    </section>
  );
}
