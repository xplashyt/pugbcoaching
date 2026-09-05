export function wompiBaseUrl(publicKey: string) {
  return publicKey.startsWith("pub_test_") ? "https://sandbox.wompi.co/v1" : "https://production.wompi.co/v1";
}

export function getPublicWompiKey() {
  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
  if (!publicKey) throw new Error("Falta configurar NEXT_PUBLIC_WOMPI_PUBLIC_KEY.");
  return publicKey;
}

export function getServerWompiConfig() {
  const publicKey = getPublicWompiKey();
  const privateKey = process.env.WOMPI_PRIVATE_KEY;
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
  const eventsSecret = process.env.WOMPI_EVENTS_SECRET;
  if (!privateKey || !integritySecret || !eventsSecret) throw new Error("Faltan las llaves privadas de Wompi en el servidor.");

  const environments = [
    publicKey.includes("_test_") ? "test" : "prod",
    privateKey.includes("_test_") ? "test" : "prod",
    integritySecret.startsWith("test_") ? "test" : "prod",
    eventsSecret.startsWith("test_") ? "test" : "prod",
  ];
  if (new Set(environments).size !== 1) throw new Error("Las cuatro llaves de Wompi deben pertenecer al mismo ambiente.");
  return { publicKey, privateKey, integritySecret, eventsSecret, baseUrl: wompiBaseUrl(publicKey), environment: environments[0] } as const;
}
