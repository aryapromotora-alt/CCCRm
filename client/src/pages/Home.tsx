import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { APP_LOGO, APP_TITLE } from "@/const";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{APP_TITLE}</h1>
            <p className="text-xl text-gray-600">Bem-vindo, {user.name}!</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Minhas Propostas</h2>
              <p className="text-gray-600 mb-6">Visualize e gerencie todas as suas propostas cadastradas.</p>
              <Button 
                onClick={() => navigate("/proposals")}
                className="w-full"
              >
                Acessar Propostas
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nova Proposta</h2>
              <p className="text-gray-600 mb-6">Cadastre uma nova proposta no sistema.</p>
              <Button 
                onClick={() => navigate("/proposals/new")}
                className="w-full"
                variant="outline"
              >
                Cadastrar Proposta
              </Button>
            </div>

            {user.role === 'admin' && (
              <>
                <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Gerenciar Usuários</h2>
                  <p className="text-gray-600 mb-6">Administre os usuários do sistema.</p>
                  <Button 
                    onClick={() => navigate("/admin/users")}
                    className="w-full"
                  >
                    Acessar Usuários
                  </Button>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Gerenciar Comissões</h2>
                  <p className="text-gray-600 mb-6">Configure as comissões por usuário e tipo de proposta.</p>
                  <Button 
                    onClick={() => navigate("/admin/commissions")}
                    className="w-full"
                    variant="outline"
                  >
                    Acessar Comissões
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">{APP_TITLE}</h1>
        <p className="text-xl text-gray-600 mb-8">Sistema de Cadastro de Propostas</p>
      <Button 
        onClick={() => window.location.href = "https://auth.manus.im/login"}
        size="lg"
        className="px-8"
      >
        Fazer Login
      </Button>
      </div>
    </div>
  );
}
