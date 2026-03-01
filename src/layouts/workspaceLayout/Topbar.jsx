import { useNavigate } from "react-router-dom";
import { Menu, X, User2 } from "lucide-react";

export default function Topbar({ expanded, setExpanded }) {
  const navigate = useNavigate();

  return (
    <header
      className="fixed top-0 left-0 right-0 h-16 
                 bg-black/90 backdrop-blur-md 
                 text-white flex items-center justify-between px-4 
                 border-b border-white/10 
                 shadow-[0_4px_12px_rgba(0,0,0,0.2)] 
                 z-40"
    >
      {/* Mobile menu toggle */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-white hover:text-gray-200 
                   transition-all duration-300 p-2 rounded-lg 
                   hover:bg-white/10 active:scale-95 lg:hover:bg-transparent lg:p-1"
        aria-label={expanded ? "Close menu" : "Open menu"}
      >
        <div className="relative w-6 h-6 flex items-center justify-center">
          <Menu
            size={22}
            className={`absolute transition-all duration-500 ease-in-out ${
              expanded
                ? "opacity-0 rotate-180 scale-75"
                : "opacity-100 rotate-0 scale-100"
            }`}
          />
          <X
            size={22}
            className={`absolute transition-all duration-500 ease-in-out ${
              expanded
                ? "opacity-100 rotate-0 scale-100"
                : "opacity-0 -rotate-180 scale-75"
            }`}
          />
        </div>
      </button>

      {/* Logo */}
      <div className="flex items-center gap-3">
        <img
          src="/brand_logo.svg"
          alt="Logo"
          className="w-10 h-10 cursor-pointer"
          onClick={() => navigate("/")}
        />
        <h1 className="text-base sm:text-lg font-semibold tracking-tight text-brand-hover ">
          Workspace
        </h1>
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate("/workspace/settings/accountinfo")}
          className="p-2 rounded-full hover:bg-white/10 transition-all duration-200"
          aria-label="Account settings"
        >
          <User2 size={20} className="text-gray-300 hover:text-white" />
        </button>
      </div>
    </header>
  );
}
