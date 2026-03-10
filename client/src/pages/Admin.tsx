import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useHubAuth } from "@/hooks/useHubAuth";
import { useLocation } from "wouter";

type UserRow = {
  id: number;
  username: string;
  displayName: string | null;
  role: "user" | "admin";
  active: boolean;
  createdAt: Date;
  lastSignedIn: Date | null;
};

function formatDate(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function Admin() {
  const { user, isAdmin, logout } = useHubAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  // Create form state
  const [showCreate, setShowCreate] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newRole, setNewRole] = useState<"user" | "admin">("user");
  const [createError, setCreateError] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState<"user" | "admin">("user");
  const [editActive, setEditActive] = useState(true);
  const [editError, setEditError] = useState("");

  const { data: users = [], isLoading } = trpc.hub.listUsers.useQuery();

  const createMutation = trpc.hub.createUser.useMutation({
    onSuccess: () => {
      utils.hub.listUsers.invalidate();
      setShowCreate(false);
      setNewUsername("");
      setNewPassword("");
      setNewDisplayName("");
      setNewRole("user");
      setCreateError("");
    },
    onError: (err) => setCreateError(err.message),
  });

  const updateMutation = trpc.hub.updateUser.useMutation({
    onSuccess: () => {
      utils.hub.listUsers.invalidate();
      setEditingId(null);
      setEditError("");
    },
    onError: (err) => setEditError(err.message),
  });

  const deleteMutation = trpc.hub.deleteUser.useMutation({
    onSuccess: () => utils.hub.listUsers.invalidate(),
  });

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const startEdit = (u: UserRow) => {
    setEditingId(u.id);
    setEditDisplayName(u.displayName ?? "");
    setEditPassword("");
    setEditRole(u.role);
    setEditActive(u.active);
    setEditError("");
  };

  const handleUpdate = (id: number) => {
    updateMutation.mutate({
      id,
      displayName: editDisplayName || undefined,
      password: editPassword || undefined,
      role: editRole,
      active: editActive,
    });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="border border-red-600 p-8 max-w-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-red-600">Acesso negado</p>
          <p className="text-sm text-black mt-2">Você não tem permissão para acessar esta área.</p>
          <button onClick={() => setLocation("/")} className="mt-4 text-xs font-black uppercase tracking-widest text-black hover:text-red-600">
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-black bg-white sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-4">
            <button onClick={() => setLocation("/")} className="flex items-center gap-3 group">
              <div className="w-5 h-5 bg-red-600 group-hover:bg-black transition-colors" />
              <span className="text-lg font-black tracking-tighter uppercase text-black">HUB PSB</span>
            </button>
            <div className="h-6 w-px bg-black" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Administração</span>
          </div>
          <div className="flex items-center gap-0 border border-black">
            <button onClick={() => setLocation("/")} className="px-4 py-2 text-xs font-black uppercase tracking-widest text-black border-r border-black hover:bg-black hover:text-white transition-colors">
              ← Painel
            </button>
            <span className="hidden sm:block px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 border-r border-black">
              {user?.displayName ?? user?.username}
            </span>
            <button onClick={handleLogout} className="px-4 py-2 text-xs font-black uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
        {/* Page title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-red-600" />
            <h1 className="text-3xl font-black tracking-tight text-black uppercase">Controle de Acesso</h1>
          </div>
          <div className="h-px bg-black" />
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
            {users.length} usuário{users.length !== 1 ? "s" : ""} cadastrado{users.length !== 1 ? "s" : ""}
          </p>
          <button
            onClick={() => { setShowCreate(!showCreate); setCreateError(""); }}
            className={`px-5 py-2 text-xs font-black uppercase tracking-widest transition-colors border border-black ${
              showCreate ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"
            }`}
          >
            {showCreate ? "Cancelar" : "+ Novo Usuário"}
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="border border-black mb-6">
            <div className="border-b border-black px-4 py-2 bg-black">
              <p className="text-xs font-black uppercase tracking-widest text-white">Novo Usuário</p>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-black">
                <label className="block px-3 pt-2 pb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Usuário *</span>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="block w-full mt-1 text-sm font-bold text-black bg-transparent outline-none"
                    placeholder="nome_usuario"
                  />
                </label>
              </div>
              <div className="border border-black">
                <label className="block px-3 pt-2 pb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Senha *</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full mt-1 text-sm font-bold text-black bg-transparent outline-none"
                    placeholder="mínimo 6 caracteres"
                  />
                </label>
              </div>
              <div className="border border-black">
                <label className="block px-3 pt-2 pb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Nome de Exibição</span>
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="block w-full mt-1 text-sm font-bold text-black bg-transparent outline-none"
                    placeholder="Nome Completo"
                  />
                </label>
              </div>
              <div className="border border-black">
                <label className="block px-3 pt-2 pb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Perfil</span>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as "user" | "admin")}
                    className="block w-full mt-1 text-sm font-bold text-black bg-transparent outline-none"
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                  </select>
                </label>
              </div>
            </div>
            {createError && (
              <div className="mx-6 mb-4 border border-red-600 bg-red-50 px-4 py-2">
                <p className="text-xs font-bold text-red-600 uppercase tracking-wide">{createError}</p>
              </div>
            )}
            <div className="px-6 pb-6">
              <button
                onClick={() => createMutation.mutate({ username: newUsername, password: newPassword, displayName: newDisplayName || undefined, role: newRole })}
                disabled={createMutation.isPending}
                className="px-6 py-3 bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {createMutation.isPending ? "Criando..." : "Criar Usuário"}
              </button>
            </div>
          </div>
        )}

        {/* Users table */}
        {isLoading ? (
          <div className="border border-black p-8 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Carregando...</p>
          </div>
        ) : (
          <div className="border border-black">
            {/* Table header */}
            <div className="grid grid-cols-12 border-b border-black bg-black text-white">
              <div className="col-span-3 px-4 py-3 text-xs font-black uppercase tracking-widest">Usuário</div>
              <div className="col-span-3 px-4 py-3 text-xs font-black uppercase tracking-widest hidden sm:block">Nome</div>
              <div className="col-span-2 px-4 py-3 text-xs font-black uppercase tracking-widest">Perfil</div>
              <div className="col-span-2 px-4 py-3 text-xs font-black uppercase tracking-widest hidden md:block">Último Acesso</div>
              <div className="col-span-2 px-4 py-3 text-xs font-black uppercase tracking-widest text-right">Ações</div>
            </div>

            {users.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Nenhum usuário encontrado</p>
              </div>
            )}

            {users.map((u, idx) => (
              <div key={u.id}>
                {editingId === u.id ? (
                  /* Edit row */
                  <div className={`border-b border-black p-4 ${!u.active ? "opacity-50" : ""}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div className="border border-black">
                        <label className="block px-3 pt-2 pb-2">
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Nome de Exibição</span>
                          <input type="text" value={editDisplayName} onChange={(e) => setEditDisplayName(e.target.value)}
                            className="block w-full mt-1 text-sm font-bold text-black bg-transparent outline-none" />
                        </label>
                      </div>
                      <div className="border border-black">
                        <label className="block px-3 pt-2 pb-2">
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Nova Senha (deixe vazio para manter)</span>
                          <input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)}
                            className="block w-full mt-1 text-sm font-bold text-black bg-transparent outline-none" placeholder="••••••••" />
                        </label>
                      </div>
                      <div className="border border-black">
                        <label className="block px-3 pt-2 pb-2">
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Perfil</span>
                          <select value={editRole} onChange={(e) => setEditRole(e.target.value as "user" | "admin")}
                            className="block w-full mt-1 text-sm font-bold text-black bg-transparent outline-none">
                            <option value="user">Usuário</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </label>
                      </div>
                      <div className="border border-black">
                        <label className="block px-3 pt-2 pb-2">
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Status</span>
                          <select value={editActive ? "active" : "inactive"} onChange={(e) => setEditActive(e.target.value === "active")}
                            className="block w-full mt-1 text-sm font-bold text-black bg-transparent outline-none">
                            <option value="active">Ativo</option>
                            <option value="inactive">Inativo</option>
                          </select>
                        </label>
                      </div>
                    </div>
                    {editError && (
                      <div className="border border-red-600 bg-red-50 px-3 py-2 mb-3">
                        <p className="text-xs font-bold text-red-600 uppercase tracking-wide">{editError}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdate(u.id)} disabled={updateMutation.isPending}
                        className="px-4 py-2 bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-colors disabled:opacity-50">
                        {updateMutation.isPending ? "Salvando..." : "Salvar"}
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="px-4 py-2 border border-black text-xs font-black uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View row */
                  <div className={`grid grid-cols-12 items-center border-b border-black last:border-b-0 ${!u.active ? "opacity-40" : ""} ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                    <div className="col-span-3 px-4 py-3">
                      <p className="text-sm font-black text-black">{u.username}</p>
                    </div>
                    <div className="col-span-3 px-4 py-3 hidden sm:block">
                      <p className="text-sm font-medium text-gray-700">{u.displayName ?? "—"}</p>
                    </div>
                    <div className="col-span-2 px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-xs font-black uppercase tracking-widest ${
                        u.role === "admin" ? "bg-red-600 text-white" : "bg-black text-white"
                      }`}>
                        {u.role === "admin" ? "Admin" : "User"}
                      </span>
                    </div>
                    <div className="col-span-2 px-4 py-3 hidden md:block">
                      <p className="text-xs text-gray-500">{formatDate(u.lastSignedIn)}</p>
                    </div>
                    <div className="col-span-2 px-4 py-3 flex justify-end gap-2">
                      <button onClick={() => startEdit(u)}
                        className="px-3 py-1 border border-black text-xs font-black uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors">
                        Editar
                      </button>
                      {u.username !== "fredmatos" && (
                        <button onClick={() => { if (confirm(`Excluir usuário "${u.username}"?`)) deleteMutation.mutate({ id: u.id }); }}
                          className="px-3 py-1 border border-red-600 text-xs font-black uppercase tracking-widest text-red-600 hover:bg-red-600 hover:text-white transition-colors">
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
