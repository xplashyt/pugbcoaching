# Cota Segura

Landing de una página para vender coaching independiente de PUBG: BATTLEGROUNDS en Colombia. Está orientada a PC, PlayStation 5 y Xbox Series X|S, en FPP o TPP. No mezcla PUBG MOBILE y no promete rangos, estadísticas ni partidas ganadas.

## Ejecutar en local

Requisitos: Node.js y npm instalados directamente en el equipo. No se usa Docker, contenedores ni WSL.

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`. Para revisar la versión de producción:

```bash
npm run build
npm start
```

El proyecto usa Next.js 16.3.4, React 18.3.1, TypeScript 5.5 y Tailwind 3.4. La plantilla pedía Next.js 14.2.x, pero su última revisión disponible (`14.2.35`) conserva vulnerabilidades altas en el análisis actual de npm; se actualizó Next sin añadir librerías de interfaz. La instalación entregada devuelve cero vulnerabilidades conocidas en `npm audit`.

## Variables de Wompi

`.env.local` y `.env.example` contienen únicamente cuatro asignaciones vacías:

- `NEXT_PUBLIC_WOMPI_PUBLIC_KEY`: llave pública; `pub_test_` selecciona Sandbox y cualquier otra selecciona producción.
- `WOMPI_PRIVATE_KEY`: llave privada que el servidor usa para crear y consultar transacciones.
- `WOMPI_INTEGRITY_SECRET`: secreto para firmar referencia, monto y moneda en el servidor.
- `WOMPI_EVENTS_SECRET`: secreto para comprobar la firma de los eventos entrantes.

Las cuatro llaves deben pertenecer al mismo ambiente. No se necesita una variable adicional. `.env.local` nunca se publica y las tres llaves privadas nunca llegan al navegador.

Después de pegar las cuatro llaves en `.env.local`, detén y vuelve a iniciar `npm run dev`. No hay que modificar ningún archivo de código. En un despliegue, carga las mismas cuatro variables en el panel del proveedor y vuelve a desplegar porque la llave pública se incorpora al código del navegador.

## Cómo funciona el pago

1. El comprador elige un entrenamiento y se crea una referencia con el prefijo `cts`, el id del plan y una marca de tiempo.
2. La bolsa de compra pide exactamente correo, nombre del titular, número de tarjeta, vencimiento y CVC, además de la aceptación obligatoria de los contratos de Wompi.
3. El navegador obtiene la llave de tokenización, cifra la tarjeta con JWE y la tokeniza directamente con Wompi. El número y el CVC no atraviesan este servidor.
4. `/api/wompi/pay` vuelve a localizar el plan desde la referencia, calcula `priceCOP * 100`, carga los contratos vigentes y firma el monto. Nunca confía en un valor enviado por el navegador.
5. Si la transacción queda `PENDING`, la interfaz consulta cada 2,5 segundos durante un máximo de cinco minutos. Este sondeo es informativo; el webhook sigue siendo la fuente de verdad.
6. `/api/wompi/webhook` verifica firma, ambiente, prefijo, moneda y monto. Solo un evento `APPROVED` válido escribe una línea `[VENTA PAGADA]` en el log.

Los rechazos conservan el `status_message` exacto y los mensajes anidados de Wompi. La interfaz distingue fondos insuficientes, tarjeta vencida o bloqueada, CVC, control de riesgo y ambiente de pruebas cuando la pasarela entrega esa información. `WS05` se presenta como rechazo genérico de seguridad: por sí solo no demuestra fraude ni falta de fondos.

`DECLINED` indica un rechazo dentro de la ruta de pago. `ERROR` es un fallo de procesamiento; por ejemplo, una tarjeta real con llaves de Sandbox produce un error de ambiente y no un rechazo bancario visible como cobro. Las tarjetas reales requieren las cuatro llaves de producción.

No hay proveedor de correo. Tras la aprobación, el comprador ve correo, referencia, id Wompi, total y soporte. El vendedor revisa el panel de Wompi y contacta personalmente al correo registrado para coordinar la entrega.

Referencias técnicas: [métodos de pago](https://docs.wompi.co/docs/colombia/metodos-de-pago/), [tokens de aceptación](https://docs.wompi.co/docs/colombia/tokens-de-aceptacion/) y [eventos](https://docs.wompi.co/docs/colombia/eventos/).

## Diseño y diferencia frente a las páginas anteriores

La página funciona como un atlas de descenso, no como un panel de juego ni una cuadrícula de cursos:

- hero abierto con paracaídas construido en CSS y curvas de nivel;
- una partida narrada como cinco momentos continuos, sin tarjetas de método;
- catálogo editorial de filas livianas y detalles plegables, sin códigos de protocolo, rangos o tabla oscura;
- hoja imprimible de rotación con seis señales y un espacio para registrar un plan propio;
- separación mediante ruta de vuelo y punto de caída;
- checkout en una bolsa inferior de ancho completo, no modal centrado, takeover, panel derecho ni documento a pantalla completa;
- una sola animación: el despliegue real de las celdas del paracaídas, desactivada con `prefers-reduced-motion`.

La tarjeta social `public/og.png` es original. No se copiaron logos, mapas, capturas, interfaz, armas, personajes o materiales oficiales. La marca Cota Segura, el dominio `cotasegura.co` y el correo `hola@cotasegura.co` son supuestos editables.

## Antes de vender

- Reemplazar marca, correo y dominio canónico si no son los definitivos.
- Grabar y revisar el contenido real; duración, prácticas y entregables publicados deben coincidir con lo que se entrega.
- Configurar las cuatro llaves del mismo ambiente, registrar la URL pública `/api/wompi/webhook` y probar `APPROVED`, `PENDING`, `DECLINED`, `ERROR`, datos inválidos y reintentos.
- Usar un comercio de Wompi por proyecto. Cada comercio admite una sola URL de eventos; aunque este webhook ignore referencias ajenas, solo la URL configurada recibe el aviso.
- Reemplazar el `Set` en memoria por persistencia idempotente. Con varias instancias puede repetirse el log y un reinicio puede perder el registro.
- Definir monitoreo y conservación segura de logs sin registrar tarjetas ni CVC.
- Mantener la entrega y el aviso de venta manuales mientras no exista un sistema operativo verificado.
- Pedir consentimiento y fijar una política de conservación para VODs que puedan incluir ids de jugadores, voces o datos de terceros.
- Revisar con un abogado colombiano retracto, reversión de pago y entrega digital bajo la Ley 1480, tratamiento de datos bajo la Ley 1581 y compras de menores.
- Hacer revisión jurídica o consulta escrita antes de usar la propiedad intelectual de PUBG comercialmente. La identidad original reduce confusión, pero no equivale a una licencia.
- Revisar periódicamente las [reglas de conducta](https://www.pubg.com/es-mx/clause/rules_of_conduct), los [términos del servicio](https://www.pubg.com/es-mx/clause/term_of_service), las [directrices de contenido](https://www.pubg.com/en/clause/content_creation_guideline/label_epicgames) y la [guía de marca](https://www.krafton.com/wp-content/uploads/2021/07/PUBG_BG_Brand_Guidelines_2021_External.pdf).
- Actualizar plataforma, perspectiva y referencias al meta. La [hoja de ruta 2026](https://pubg.com/es-mx/news/9855) explica que el balance de armas cambia regularmente; por eso la landing no promete armas, accesorios o rutas fijas.

El servicio debe seguir siendo educativo: el comprador usa siempre su propia cuenta. No se piden credenciales, no se juega Ranked por él, no se ofrece boosting, no se manipulan resultados y no se recomiendan macros, scripts, adaptadores o software externo no autorizado.

No se construyeron base de datos, login, carrito, panel administrativo, automatización de correo ni entrega automática porque están fuera del alcance.
