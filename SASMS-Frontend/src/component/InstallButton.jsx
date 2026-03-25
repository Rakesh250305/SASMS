import { useEffect, useState } from "react";

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      console.log("User installed app");
    }

    setDeferredPrompt(null);
  };

  if (!deferredPrompt) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999]">
        <button onClick={installApp} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
            Install App
        </button>
    </div>
  );
}