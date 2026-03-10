import { useHubAuth } from "@/hooks/useHubAuth";
import { useLocation } from "wouter";
import { useState } from "react";

const MAPA_URL = "https://mapavotpsb-nsym6mnr.manus.space/?code=ViZDFfcU8BXXUFXx4a5ttY";
const NOTICIAS_URL = "https://outroladoblog-6tonxdxy.manus.space/";

type ActiveView = "home" | "mapa" | "noticias";

export default function Dashboard() {
  const { user, isAdmin, logout } = useHubAuth();
  const [, setLocation] = useLocation();
  const [activeView, setActiveView] = useState<ActiveView>("home");

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top navigation bar */}
      <header className="border-b border-black bg-white sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 h-14">
          {/* Logo */}
          <button
            onClick={() => setActiveView("home")}
            className="flex items-center gap-3 group"
          >
            <div className="w-5 h-5 bg-red-600 group-hover:bg-black transition-colors" />
            <span className="text-lg font-black tracking-tighter uppercase text-black">HUB PSB</span>
          </button>

          {/* Center nav */}
          <nav className="hidden md:flex items-center gap-0 border border-black">
            <button
              onClick={() => setActiveView("mapa")}
              className={`px-5 py-2 text-xs font-black uppercase tracking-widest border-r border-black transition-colors ${
                activeView === "mapa"
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-red-600 hover:text-white"
              }`}
            >
              Mapa de Votação
            </button>
            <button
              onClick={() => setActiveView("noticias")}
              className={`px-5 py-2 text-xs font-black uppercase tracking-widest transition-colors ${
                activeView === "noticias"
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-red-600 hover:text-white"
              }`}
            >
              Monitoramento de Notícias
            </button>
          </nav>

          {/* Right: user info + admin + logout */}
          <div className="flex items-center gap-0 border border-black">
            <span className="hidden sm:block px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 border-r border-black">
              {user?.displayName ?? user?.username}
            </span>
            {isAdmin && (
              <button
                onClick={() => setLocation("/admin")}
                className="px-4 py-2 text-xs font-black uppercase tracking-widest text-black border-r border-black hover:bg-red-600 hover:text-white transition-colors"
              >
                Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs font-black uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex border-t border-black">
          <button
            onClick={() => setActiveView("mapa")}
            className={`flex-1 py-2 text-xs font-black uppercase tracking-wider border-r border-black transition-colors ${
              activeView === "mapa" ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            Mapa de Votação
          </button>
          <button
            onClick={() => setActiveView("noticias")}
            className={`flex-1 py-2 text-xs font-black uppercase tracking-wider transition-colors ${
              activeView === "noticias" ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            Monitoramento
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {activeView === "home" && (
          <div className="flex-1 flex flex-col">
            {/* Hero */}
            <div className="border-b border-black px-8 py-16 md:py-24">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-start gap-4 mb-8">
                  <div className="w-3 h-16 bg-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                      Partido Socialista Brasileiro
                    </p>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-black uppercase leading-none">
                      Central de<br />Informações
                    </h1>
                  </div>
                </div>
                <div className="h-px bg-black mb-6" />
                <p className="text-sm text-gray-600 max-w-lg font-medium">
                  Selecione um dos módulos abaixo para acessar as ferramentas de análise e monitoramento do partido.
                </p>
              </div>
            </div>

            {/* Cards */}
            <div className="flex-1 px-8 py-12">
              <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-0 border border-black">
                {/* Card 1 — Mapa de Votação */}
                <div className="border-b md:border-b-0 md:border-r border-black p-8 flex flex-col group hover:bg-black transition-colors duration-200 cursor-pointer"
                  onClick={() => setActiveView("mapa")}>
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-red-600 group-hover:bg-white transition-colors" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-500">
                      01
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-400 mb-2">
                      Módulo
                    </p>
                    <h2 className="text-3xl font-black tracking-tight text-black group-hover:text-white uppercase leading-tight mb-4">
                      Mapa de<br />Votação
                    </h2>
                    <p className="text-sm text-gray-500 group-hover:text-gray-400">
                      Visualize dados eleitorais e resultados de votação em mapa interativo.
                    </p>
                  </div>
                  <div className="mt-8">
                    <div className="h-px bg-black group-hover:bg-white mb-4" />
                    <span className="text-xs font-black uppercase tracking-widest text-black group-hover:text-white">
                      Acessar →
                    </span>
                  </div>
                </div>

                {/* Card 2 — Monitoramento de Notícias */}
                <div className="p-8 flex flex-col group hover:bg-red-600 transition-colors duration-200 cursor-pointer"
                  onClick={() => setActiveView("noticias")}>
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-black group-hover:bg-white transition-colors" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-red-200">
                      02
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-red-200 mb-2">
                      Módulo
                    </p>
                    <h2 className="text-3xl font-black tracking-tight text-black group-hover:text-white uppercase leading-tight mb-4">
                      Monitoramento<br />de Notícias
                    </h2>
                    <p className="text-sm text-gray-500 group-hover:text-red-100">
                      Acompanhe notícias e menções ao partido em tempo real.
                    </p>
                  </div>
                  <div className="mt-8">
                    <div className="h-px bg-black group-hover:bg-white mb-4" />
                    <span className="text-xs font-black uppercase tracking-widest text-black group-hover:text-white">
                      Acessar →
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-black px-8 py-4">
              <div className="max-w-5xl mx-auto flex items-center justify-between">
                <p className="text-xs text-gray-400 uppercase tracking-widest">HUB PSB — Sistema Interno</p>
                <p className="text-xs text-gray-400 uppercase tracking-widest">Acesso Restrito</p>
              </div>
            </div>
          </div>
        )}

        {(activeView === "mapa" || activeView === "noticias") && (
          <div className="flex-1 flex flex-col">
            {/* Breadcrumb bar */}
            <div className="border-b border-black px-6 py-2 flex items-center gap-3 bg-white">
              <button
                onClick={() => setActiveView("home")}
                className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
              >
                Início
              </button>
              <span className="text-gray-300">›</span>
              <span className="text-xs font-bold uppercase tracking-widest text-black">
                {activeView === "mapa" ? "Mapa de Votação" : "Monitoramento de Notícias"}
              </span>
              <div className="ml-auto">
                <a
                  href={activeView === "mapa" ? MAPA_URL : NOTICIAS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors"
                >
                  Abrir em nova aba ↗
                </a>
              </div>
            </div>
            {/* Iframe */}
            <iframe
              key={activeView}
              src={activeView === "mapa" ? MAPA_URL : NOTICIAS_URL}
              className="flex-1 w-full border-0"
              title={activeView === "mapa" ? "Mapa de Votação" : "Monitoramento de Notícias"}
              allow="fullscreen"
            />
          </div>
        )}
      </main>
    </div>
  );
}
