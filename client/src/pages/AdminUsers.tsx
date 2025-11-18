import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminUsers() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");

  const { data: users, isLoading, refetch } = trpc.users.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });

  if (!isAuthenticated || user?.role !== 'admin') {
    navigate("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim()) {
      toast.error("Digite um email válido");
      return;
    }
    toast.success(`Funcionário ${newUserEmail} será adicionado quando fizer o primeiro login`);
    setNewUserEmail("");
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Gerenciar Funcionários</h1>
            <p className="text-gray-600">Total: {users?.length || 0} funcionário(s)</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancelar" : "Adicionar Funcionário"}
            </Button>
            <Button onClick={() => navigate("/")} variant="outline">
              Voltar
            </Button>
          </div>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Adicionar Novo Funcionário</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email do Funcionário *
                  </label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="funcionario@example.com"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    O funcionário será adicionado ao sistema quando fizer o primeiro login
                  </p>
                </div>
                <Button type="submit" className="w-full">
                  Registrar Funcionário
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {users && users.length > 0 ? (
          <div className="grid gap-6">
            {users.map((u) => (
              <Card key={u.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{u.name || "Sem nome"}</CardTitle>
                      <p className="text-sm text-gray-600 mt-2">{u.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      u.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {u.role === 'admin' ? 'Administrador' : 'Funcionário'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Data de Cadastro</p>
                      <p className="text-lg font-semibold">{new Date(u.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Último Acesso</p>
                      <p className="text-lg font-semibold">{new Date(u.lastSignedIn).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => navigate(`/admin/commissions?userId=${u.id}`)}
                      variant="outline"
                      size="sm"
                    >
                      Ver Comissões
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 mb-4">Nenhum funcionário cadastrado ainda.</p>
              <Button onClick={() => setShowForm(true)}>
                Adicionar Primeiro Funcionário
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
