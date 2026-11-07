export interface Page { title: string; body: string[] }
export const AYUDA: Record<string, Page> = {
  envios: { title: "Envíos", body: ["Enviamos a todo el país. CABA y GBA: 2 a 4 días hábiles. Interior: 4 a 7 días hábiles.", "Envío gratis en compras desde $ 120.000. También podés retirar gratis en nuestro local."] },
  "cambios-y-devoluciones": { title: "Cambios y devoluciones", body: ["Tenés 30 días desde que recibís tu pedido para solicitar un cambio o devolución.", "Las prendas deben estar sin uso y con etiquetas. Escribinos por WhatsApp o pasá por el local."] },
  seguimiento: { title: "Seguimiento de pedido", body: ["Cuando tu pedido sale de nuestro depósito te enviamos el código de seguimiento por email. También podés ver el estado en el link de confirmación de tu compra."] },
  "medios-de-pago": { title: "Medios de pago", body: ["Mercado Pago (tarjetas de crédito y débito, hasta 3 cuotas sin interés), transferencia bancaria y efectivo en el local con retiro."] },
  talles: { title: "Guía de talles", body: ["Medí tu contorno de pecho, cintura y cadera en centímetros y compará con la tabla de cada producto. Si estás entre dos talles, te recomendamos el más grande para prendas holgadas y el menor para prendas de compresión."] },
};
export const PAGINAS: Record<string, Page> = {
  nosotros: { title: "Nosotros", body: ["Holy Fitness es una marca argentina de ropa deportiva. Diseñamos prendas pensadas para entrenar de verdad, con tela de alto rendimiento y calce cómodo.", "[Completar con la historia de la marca]"] },
  local: { title: "Nuestro local", body: ["Dirección: [completar]", "Horarios: [completar]", "Teléfono / WhatsApp: [completar]"] },
  "trabaja-con-nosotros": { title: "Trabajá con nosotros", body: ["Escribinos a [email a completar] con tu CV y contanos qué te gustaría hacer."] },
};
export const LEGALES: Record<string, Page> = {
  terminos: { title: "Términos y condiciones", body: ["[Texto legal a completar con asesoría. Razón social, CUIT, domicilio, condiciones de compra, precios, envíos, cambios y jurisdicción.]"] },
  privacidad: { title: "Política de privacidad", body: ["[Texto legal a completar. Tratamiento de datos personales conforme a la Ley 25.326. Contacto de la Agencia de Acceso a la Información Pública.]"] },
  arrepentimiento: { title: "Botón de arrepentimiento", body: ["Conforme a la Ley 24.240 podés revocar tu compra dentro de los 10 días corridos desde la recepción del producto, sin costo.", "Para solicitarlo escribinos a [email a completar] indicando tu número de pedido."] },
  "defensa-del-consumidor": { title: "Defensa del consumidor", body: ["Ante cualquier reclamo podés dirigirte a la Dirección General de Defensa del Consumidor de tu jurisdicción. [Completar con datos del local y razón social]"] },
};
export const BLOG: Record<string, Page> = {
  "cuidado-de-tus-prendas": { title: "Cuidado de tus prendas", body: ["Lavá del revés en agua fría, sin suavizante y secá a la sombra. Así tu ropa técnica mantiene la elasticidad y el color por más tiempo."] },
};
