export async function unregister(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    registration.unregister();
  } catch(error) {
    console.error(error.message);
  }
}
