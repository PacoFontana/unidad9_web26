UNIDAD 9 — SITIO WEB

1) Abre assets/config.js.
2) Reemplaza únicamente los enlaces que empiezan por TU-PAGO- por tus URLs reales de pago.
3) También puedes actualizar tus enlaces de autorización, Discord, mapas y TikTok si los cambias.
4) Sube toda la carpeta unidad9_web al hosting.

PÁGINAS
- index.html: portada, servidores, acceso, normativas, daño a estructuras, RECONS, beneficios mensuales y comunidad.
- recons.html: tienda de RECONS con 4 paquetes y métodos de pago.

IMPORTANTE
- La acreditación de RECONS es manual: después del pago, el jugador debe ir al Discord del servidor deseado → Soporte → Comprar RECONS y enviar el comprobante.
- Los beneficios mensuales tienen una duración de 31 días.
- El VIP Premium cuesta US$ 5/mes, se paga con dinero real y aplica a Chernarus y Livonia.
- La cantidad exacta de RECONS ganada por tiempo online no se muestra numéricamente porque no fue especificada; el sitio explica que existe una recompensa por permanencia online.

DAÑO A ESTRUCTURAS
- El horario se configura en assets/config.js mediante U9_DAMAGE_SCHEDULE.
- disabledStart y disabledEnd usan formato 24 h y se interpretan en America/Argentina/Buenos_Aires (UTC−3).
- El contador calcula el siguiente cambio de estado de forma independiente de la zona horaria del visitante.

ENLACES
- Todos los botones externos leen sus destinos desde assets/config.js.
- No cambies los nombres de las claves (authorization, discordChernarus, paypal1, mercadopago1, binance1, etc.).
- Reemplaza únicamente las URLs TU-PAGO-... por tus enlaces reales.
