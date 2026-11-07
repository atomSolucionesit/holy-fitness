const SIZES = { p: [800, 1000], l: [1600, 900], v: [900, 1600] } as const;
const clean = (s: string) => s.replace(/[<>&"']/g, "").slice(0, 40);
export function GET(req: Request) {
  const u = new URL(req.url);
  const [w, h] = SIZES[(u.searchParams.get("r") as keyof typeof SIZES) ?? "p"] ?? SIZES.p;
  const tone = (u.searchParams.get("t") ?? "e9e9e9").replace(/[^0-9a-f]/gi, "").slice(0, 6) || "e9e9e9";
  const label = clean(u.searchParams.get("l") ?? "HOLY FITNESS");
  const n = u.searchParams.get("n") === "2";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="#${tone}"/><g fill="#0a0a0a" opacity=".16"><ellipse cx="${n ? w * 0.55 : w * 0.5}" cy="${h * 0.42}" rx="${w * 0.2}" ry="${h * 0.26}"/></g><text x="50%" y="${h * 0.9}" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="${Math.round(w / 22)}" fill="#0a0a0a" opacity=".45">${label.toUpperCase()}</text></svg>`;
  return new Response(svg, { headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=31536000, immutable" } });
}
