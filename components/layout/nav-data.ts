export const NAV = {
  mujer: { label: "Mujer", cols: [
    { title: "Tendencias", links: [["Novedades", "/mujer?orden=novedades"], ["Más vendidos", "/mujer?orden=mas-vendidos"], ["Ofertas", "/mujer?oferta=1"]] },
    { title: "Prendas", links: [["Calzas", "/mujer/calzas"], ["Tops", "/mujer/tops"], ["Remeras", "/mujer/remeras"], ["Shorts", "/mujer/shorts"], ["Buzos", "/mujer/buzos"], ["Camperas", "/mujer/camperas"], ["Conjuntos", "/mujer/conjuntos"]] },
    { title: "Colecciones", links: [["Sculpt", "/coleccion/sculpt"], ["Flow", "/coleccion/flow"], ["Impact", "/coleccion/impact"], ["Invierno", "/coleccion/invierno"]] },
    { title: "Por actividad", links: [["Lifting", "/mujer?actividad=lifting"], ["Running", "/mujer?actividad=running"], ["HIIT", "/mujer?actividad=hiit"], ["Pilates", "/mujer?actividad=pilates"]] },
  ], feature: { title: "Sculpt", href: "/coleccion/sculpt", image: "/img/m-calzas.jpg" } },
  zapatillas: { label: "Zapatillas", cols: [
    { title: "Tendencias", links: [["Novedades", "/zapatillas?orden=novedades"], ["Más vendidas", "/zapatillas?orden=mas-vendidos"], ["Ofertas", "/zapatillas?oferta=1"]] },
    { title: "Tipo", links: [["Running", "/zapatillas/running"], ["Training", "/zapatillas/training"], ["Urbanas", "/zapatillas/urbanas"]] },
    { title: "Por actividad", links: [["Running", "/zapatillas?actividad=running"], ["Lifting", "/zapatillas?actividad=lifting"], ["HIIT", "/zapatillas?actividad=hiit"], ["Pilates", "/zapatillas?actividad=pilates"]] },
  ], feature: { title: "Running", href: "/zapatillas/running", image: "/img/z-running.jpg" } },
  accesorios: { label: "Accesorios", cols: [
    { title: "Accesorios", links: [["Gorras", "/accesorios/gorras"], ["Mochilas y bolsos", "/accesorios/mochilas"], ["Botellas", "/accesorios/botellas"], ["Medias", "/accesorios/medias"], ["Gym", "/accesorios/gym"]] },
    { title: "Última oportunidad", links: [["Ofertas", "/accesorios?oferta=1"]] },
  ], feature: { title: "Essentials", href: "/coleccion/essentials", image: "/img/a-mochilas.jpg" } },
} as const;
export type NavKey = keyof typeof NAV;
