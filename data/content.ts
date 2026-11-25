export interface Page { title: string; body: string[] }
export const AYUDA: Record<string, Page> = {
  envios: { title: "Envíos", body: ["Enviamos a todo el país. CABA y GBA: 2 a 4 días hábiles. Interior: 4 a 7 días hábiles.", "Envío gratis en compras desde $ 120.000. También podés retirar gratis en nuestro local."] },
  "cambios-y-devoluciones": { title: "Cambios y devoluciones", body: ["Tenés 30 días desde que recibís tu pedido para solicitar un cambio o devolución.", "Las prendas deben estar sin uso y con etiquetas. Escribinos por WhatsApp o pasá por el local."] },
  seguimiento: { title: "Seguimiento de pedido", body: ["Cuando tu pedido sale de nuestro depósito te enviamos el código de seguimiento por email. También podés ver el estado en el link de confirmación de tu compra."] },
  "medios-de-pago": { title: "Medios de pago", body: ["Mercado Pago (tarjetas de crédito y débito, hasta 3 cuotas sin interés), transferencia bancaria y efectivo en el local con retiro."] },
};
export const PAGINAS: Record<string, Page> = {
  nosotros: { title: "Nosotros", body: ["Holy Fitness es una marca argentina de ropa deportiva. Diseñamos prendas pensadas para entrenar de verdad, con tela de alto rendimiento y calce cómodo.", "Te esperamos en nuestro local físico en Colón 1037, Paso de los Libres, Corrientes, o a través de nuestra tienda online con envíos a todo el país."] },
  local: {
    title: "Nuestro local",
    body: [
      "Dirección: Colón 1037, Paso de los Libres, Corrientes.",
      "Horarios: Lunes a sábados de 9:00 a 12:30 hs y de 17:00 a 21:00 hs.",
      "Celular / WhatsApp: 3772 563993.",
    ],
  },
};
export const LEGALES: Record<string, Page> = {
  terminos: {
    title: "Términos y condiciones",
    body: [
      "1. Identificación y aceptación: El presente sitio web es operado por Holy Fitness, con local físico en Colón 1037, Paso de los Libres, Corrientes, Argentina (WhatsApp: 3772 563993 · Email: holyfitness@gmail.com · Instagram: @holyfit.ness). Al navegar o realizar una compra en la tienda online, aceptás estos Términos y Condiciones.",
      "2. Productos, stock y precios: Todos los precios publicados están expresados en pesos argentinos (ARS) e incluyen los impuestos aplicables, salvo indicación expresa en contrario. Los precios y promociones pueden modificarse sin previo aviso, respetándose siempre el valor vigente al momento de confirmar tu compra. La disponibilidad de stock se valida al confirmar el pedido.",
      "3. Medios de pago: Podés abonar tus compras a través de los medios habilitados en el checkout: Mercado Pago (tarjetas de crédito, débito y dinero en cuenta), transferencia bancaria y efectivo al retirar en el local. Los pedidos por transferencia bancaria quedan sujetos a la acreditación del pago.",
      "4. Envíos y retiro en local: Realizamos envíos a todo el país (plazo estimado de 2 a 4 días hábiles para CABA/GBA y de 4 a 7 días hábiles para el interior, contados desde el despacho). El costo de envío se calcula en el checkout según tu código postal, con envío bonificado en compras que superen el monto vigente informado en el sitio. También podés elegir retiro gratuito en nuestro local de Colón 1037, de lunes a sábados de 9:00 a 12:30 hs y de 17:00 a 21:00 hs.",
      "5. Cambios y devoluciones: Podés solicitar un cambio o devolución dentro de los 30 días corridos desde la recepción del pedido, siempre que la prenda se encuentre sin uso, en perfecto estado y con sus etiquetas originales. En compras online también rige el plazo legal de 10 días corridos desde la entrega para revocar la compra conforme a la Ley 24.240. Para gestionarlo, escribinos por WhatsApp al 3772 563993 o acercate al local.",
      "6. Cuenta de usuario: Podés comprar como invitado o iniciar sesión con tu cuenta de Google para consultar tu historial de pedidos, guardar favoritos y agilizar tus próximas compras. Sos responsable por la veracidad de los datos ingresados para el contacto y la entrega.",
      "7. Propiedad intelectual y jurisdicción: Las imágenes, textos, diseños y marcas publicados en este sitio pertenecen a Holy Fitness o a sus respectivos titulares y no pueden reproducirse sin autorización. Estos términos se rigen por las leyes de la República Argentina, sometiéndose cualquier controversia a los tribunales competentes de la jurisdicción correspondiente.",
    ],
  },
  privacidad: {
    title: "Política de privacidad",
    body: [
      "1. Compromiso y marco legal: En Holy Fitness cuidamos tus datos personales y los tratamos conforme a la Ley Nacional N.º 25.326 de Protección de Datos Personales de la República Argentina y sus normas complementarias.",
      "2. Datos que recopilamos: Al realizar una compra o crear tu cuenta recopilamos únicamente los datos necesarios para operar la tienda: nombre y apellido, correo electrónico, teléfono/WhatsApp, dirección y código postal de entrega, e historial de pedidos. Si elegís ingresar con Google (mediante Firebase Authentication), recibimos tu nombre y correo electrónico verificados por Google para identificar tu cuenta y vincular tus pedidos y favoritos.",
      "3. Finalidad del uso: Utilizamos tu información exclusivamente para procesar y confirmar pedidos, coordinar envíos o retiros en el local, enviarte el estado y seguimiento de tu compra, gestionar cambios o devoluciones y brindarte atención al cliente.",
      "4. Pagos y terceros: Los pagos electrónicos se procesan de manera segura a través de Mercado Pago; Holy Fitness nunca accede ni almacena los números completos ni códigos de seguridad de tus tarjetas. Únicamente compartimos los datos indispensables de entrega con el operador logístico elegido para hacer llegar tu pedido.",
      "5. Cookies y seguridad: Utilizamos cookies técnicas esenciales (incluyendo cookies de sesión seguras) para mantener tu carrito, tus favoritos y tu sesión iniciada mientras navegás por el sitio. Adoptamos medidas técnicas y organizativas razonables para proteger tus datos contra accesos no autorizados o pérdidas.",
      "6. Derechos del titular: Como titular de los datos personales tenés derecho a acceder, rectificar, actualizar o solicitar la supresión de tu información en cualquier momento, escribiéndonos a holyfitness@gmail.com o por WhatsApp al 3772 563993, o personalmente en Colón 1037, Paso de los Libres, Corrientes.",
      "7. Órgano de control: La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley N.º 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.",
    ],
  },
};
export const BLOG: Record<string, Page> = {
  "cuidado-de-tus-prendas": { title: "Cuidado de tus prendas", body: ["Lavá del revés en agua fría, sin suavizante y secá a la sombra. Así tu ropa técnica mantiene la elasticidad y el color por más tiempo."] },
};
