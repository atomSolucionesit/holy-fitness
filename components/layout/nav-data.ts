export const NAV = {
  mujer: { label: "Mujer", cols: [
    { title: "Tendencias", links: [["Novedades", "/mujer?orden=novedades"], ["Más vendidos", "/mujer?orden=mas-vendidos"], ["Ofertas", "/mujer?oferta=1"]] },
    { title: "Prendas", links: [["Calzas", "/mujer/calzas"], ["Tops", "/mujer/tops"], ["Remeras", "/mujer/remeras"], ["Shorts", "/mujer/shorts"], ["Buzos", "/mujer/buzos"], ["Camperas", "/mujer/camperas"], ["Conjuntos", "/mujer/conjuntos"]] },
    { title: "Colecciones", links: [["Sculpt", "/coleccion/sculpt"], ["Flow", "/coleccion/flow"], ["Impact", "/coleccion/impact"], ["Invierno", "/coleccion/invierno"]] },
    { title: "Por actividad", links: [["Lifting", "/mujer?actividad=lifting"], ["Running", "/mujer?actividad=running"], ["HIIT", "/mujer?actividad=hiit"], ["Pilates", "/mujer?actividad=pilates"]] },
  ], feature: { title: "Sculpt", href: "/coleccion/sculpt", tone: "dcdcdc" } },
  hombre: { label: "Hombre", cols: [
    { title: "Tendencias", links: [["Novedades", "/hombre?orden=novedades"], ["Más vendidos", "/hombre?orden=mas-vendidos"], ["Ofertas", "/hombre?oferta=1"]] },
    { title: "Prendas", links: [["Remeras", "/hombre/remeras"], ["Shorts", "/hombre/shorts"], ["Joggers", "/hombre/joggers"], ["Buzos", "/hombre/buzos"], ["Camperas", "/hombre/camperas"], ["Calzas", "/hombre/calzas"]] },
    { title: "Colecciones", links: [["Essentials", "/coleccion/essentials"], ["Impact", "/coleccion/impact"], ["Invierno", "/coleccion/invierno"]] },
    { title: "Por actividad", links: [["Lifting", "/hombre?actividad=lifting"], ["Running", "/hombre?actividad=running"], ["HIIT", "/hombre?actividad=hiit"]] },
  ], feature: { title: "Invierno", href: "/coleccion/invierno", tone: "c5cbda" } },
  accesorios: { label: "Accesorios", cols: [
    { title: "Accesorios", links: [["Gorras", "/accesorios/gorras"], ["Mochilas y bolsos", "/accesorios/mochilas"], ["Botellas", "/accesorios/botellas"], ["Medias", "/accesorios/medias"], ["Gym", "/accesorios/gym"]] },
    { title: "Última oportunidad", links: [["Ofertas", "/accesorios?oferta=1"]] },
  ], feature: { title: "Essentials", href: "/coleccion/essentials", tone: "e6dccb" } },
} as const;
export type NavKey = keyof typeof NAV;
