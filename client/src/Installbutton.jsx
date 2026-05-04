import { useEffect, useState } from "react";

function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log("✅ Install prompt available");
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert("App is not ready to install yet");
      return;
    }

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return (
    <button
      onClick={handleInstall}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        padding: "14px 20px",
        background: isInstallable ? "#000" : "#999",
        color: "#fff",
        border: "none",
        borderRadius: "50px",
        boxShadow: "0 6px 15px rgba(0,0,0,0.3)",
        cursor: "pointer",
        zIndex: 9999,
        fontSize: "14px",
        opacity: isInstallable ? 1 : 0.6
      }}
    >
      📲 {isInstallable ? "Install App" : "Checking..."}
    </button>
  );
}

export default InstallButton;