const PHONE = '917019489945';
const MESSAGE = "Hi Sahara Bank, I'd like some help.";

export default function WhatsAppButton() {
  const href = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BD5A] shadow-lg flex items-center justify-center transition"
    >
      <svg viewBox="0 0 32 32" className="w-8 h-8" fill="white">
        <path d="M16.001 3C9.107 3 3.5 8.607 3.5 15.5c0 2.36.655 4.566 1.792 6.452L3 29l7.24-2.257A12.44 12.44 0 0016 28c6.894 0 12.5-5.607 12.5-12.5S22.895 3 16.001 3zm7.334 17.86c-.31.874-1.537 1.6-2.517 1.81-.669.14-1.542.253-4.48-.962-3.76-1.557-6.18-5.373-6.37-5.622-.184-.25-1.523-2.028-1.523-3.868 0-1.84.966-2.744 1.31-3.12.31-.34.673-.425.899-.425.226 0 .451.002.649.012.208.01.487-.08.762.581.31.744 1.055 2.584 1.148 2.772.093.187.155.406.031.656-.124.25-.186.406-.372.624-.186.218-.393.487-.562.653-.186.187-.38.39-.163.765.217.375.964 1.591 2.07 2.578 1.421 1.269 2.62 1.66 2.995 1.848.375.187.594.156.812-.094.217-.25.93-1.084 1.178-1.456.248-.372.497-.31.837-.187.34.125 2.164 1.02 2.535 1.207.372.187.62.28.712.437.093.156.093.905-.217 1.779z" />
      </svg>
    </a>
  );
}
