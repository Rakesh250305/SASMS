import { useEffect, useState } from "react";

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  if (!deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
         <button className='px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors'>Install</button>      
     </div>
  );
}
