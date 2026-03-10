import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useHubAuth } from "@/hooks/useHubAuth";
import { useLocation } from "wouter";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { refetch } = useHubAuth();
  const [, setLocation] = useLocation();

  const loginMutation = trpc.hub.login.useMutation({
    onSuccess: async () => {
      await refetch();
      setLocation("/");
    },
    onError: (err) => {
      setError(err.message || "Credenciais inválidas");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Preencha todos os campos");
      return;
    }
    loginMutation.mutate({ username: username.trim(), password });
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-black">
        <div>
          <div className="w-8 h-8 bg-red-600 mb-12" />
          <div className="space-y-0">
            <h1 className="text-7xl font-black tracking-tighter text-black leading-none uppercase">
              HUB
            </h1>
            <h1 className="text-7xl font-black tracking-tighter text-black leading-none uppercase">
              PSB
            </h1>
          </div>
        </div>

        <div className="space-y-6">
          <div className="h-px bg-black w-full" />
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-black p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Sistema</p>
              <p className="text-sm font-bold text-black">Mapa de Votação</p>
            </div>
            <div className="border border-black p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Sistema</p>
              <p className="text-sm font-bold text-black">Monitoramento de Notícias</p>
            </div>
          </div>
          <div className="h-px bg-black w-full" />
          <p className="text-xs text-gray-400 uppercase tracking-widest">
            Acesso restrito — credenciais obrigatórias
          </p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20">
        {/* Mobile header */}
        <div className="lg:hidden mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-5 h-5 bg-red-600" />
            <span className="text-2xl font-black tracking-tighter uppercase text-black">HUB PSB</span>
          </div>
          <div className="h-px bg-black w-full" />
        </div>

        <div className="max-w-sm w-full">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-red-600 mb-2">Acesso ao Sistema</p>
            <h2 className="text-3xl font-black tracking-tight text-black uppercase">Entrar</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-0">
            <div className="border border-black">
              <div className="border-b border-black">
                <label className="block px-4 pt-3 pb-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Usuário</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    autoFocus
                    className="block w-full mt-1 pb-2 text-base font-bold text-black bg-transparent outline-none placeholder-gray-300"
                    placeholder="nome de usuário"
                  />
                </label>
              </div>
              <div>
                <label className="block px-4 pt-3 pb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Senha</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="block w-full mt-1 text-base font-bold text-black bg-transparent outline-none placeholder-gray-300"
                    placeholder="••••••••"
                  />
                </label>
              </div>
            </div>

            {error && (
              <div className="border border-red-600 bg-red-50 px-4 py-3 mt-0">
                <p className="text-xs font-bold text-red-600 uppercase tracking-wide">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-black text-white py-4 font-black uppercase tracking-widest text-sm hover:bg-red-600 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-0"
            >
              {loginMutation.isPending ? "Verificando..." : "Acessar"}
            </button>
          </form>

          <div className="mt-8 h-px bg-black" />
          <p className="mt-4 text-xs text-gray-400 uppercase tracking-widest">
            Acesso autorizado somente
          </p>
        </div>
      </div>
    </div>
  );
}
