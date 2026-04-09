(() => {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./service-worker.js");
    } catch {
      // If registration fails (unsupported context, blocked, etc.), the site should still work online.
    }
  });
})();

