import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

const PROPOSAL_TYPES = [
  { value: "novo", label: "Novo" },
  { value: "refinanciamento", label: "Refinanciamento" },
  { value: "portabilidade", label: "Portabilidade" },
  { value: "refin_portabilidade", label: "Refin. Portabilidade" },
  { value: "refin_carteira", label: "Refin. Carteira" },
  { value: "fgts", label: "FGTS" },
  { value: "clt", label: "CLT" },
  { value: "outros", label: "Outros" },
];

const BANKS = [
  "Banco do Brasil",
  "Caixa Econômica",
  "Bradesco",
  "Itaú",
  "Santander",
  "Nubank",
  "Inter",
  "Outro",
];

export default function AdminCommissions() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    userId: "",
    bank: "",
    proposalType: "novo",
    commissionPercentage: "",
  });

  const { data: users } = trpc.users.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: commissions, refetch } = trpc.commissions.listAll.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const createCommission = trpc.commissions.create.useMutation({
    onSuccess: () => {
      toast.success("Comissão criada com sucesso!");
      setFormData({ userId: "", bank: "", proposalType: "novo", commissionPercentage: "" });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar comissão");
    },
  });

  const updateCommission = trpc.commissions.update.useMutation({
    onSuccess: () => {
      toast.success("Comissão atualizada com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar comissão");
    },
  });

  const deleteCommission = trpc.commissions.delete.useMutation({
    onSuccess: () => {
      toast.success("Comissão deletada com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar comissão");
    },
  });

  if (!isAuthenticated || user?.role !== 'admin') {
    navigate("/");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userId || !formData.bank || !formData.commissionPercentage) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createCommission.mutate({
      userId: parseInt(formData.userId),
      bank: formData.bank,
      proposalType: formData.proposalType as any,
      commissionPercentage: Math.round(parseFloat(formData.commissionPercentage) * 100),
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredCommissions = selectedUserId
    ? commissions?.filter(c => c.userId === selectedUserId)
    : commissions;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Gerenciar Comissões</h1>
            <p className="text-gray-600">Configure as comissões por usuário, banco e tipo de proposta</p>
          </div>
          <Button onClick={() => navigate("/")} variant="outline">
            Voltar
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Formulário */}
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Comissão</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuário *
                  </label>
                  <select
                    name="userId"
                    value={formData.userId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um usuário</option>
                    {users?.map(u => (
                      <option key={u.id} value={u.id}>{u.name || u.email}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Banco *
                  </label>
                  <select
                    name="bank"
                    value={formData.bank}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um banco</option>
                    {BANKS.map(bank => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Proposta *
                  </label>
                  <select
                    name="proposalType"
                    value={formData.proposalType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PROPOSAL_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Percentual de Comissão (%) *
                  </label>
                  <input
                    type="number"
                    name="commissionPercentage"
                    value={formData.commissionPercentage}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5.00"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createCommission.isPending}
                  className="w-full"
                >
                  Adicionar Comissão
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Filtro */}
          <Card>
            <CardHeader>
              <CardTitle>Filtrar por Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedUserId || ""}
                onChange={(e) => setSelectedUserId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os usuários</option>
                {users?.map(u => (
                  <option key={u.id} value={u.id}>{u.name || u.email}</option>
                ))}
              </select>
              <p className="text-sm text-gray-600 mt-4">
                Total: {filteredCommissions?.length || 0} comissão(ões)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Comissões */}
        {filteredCommissions && filteredCommissions.length > 0 ? (
          <div className="grid gap-4">
            {filteredCommissions.map((commission) => {
              const commissionUser = users?.find(u => u.id === commission.userId);
              const proposalType = PROPOSAL_TYPES.find(t => t.value === commission.proposalType);

              return (
                <Card key={commission.id}>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-5 gap-4 items-center">
                      <div>
                        <p className="text-sm text-gray-600">Usuário</p>
                        <p className="font-semibold">{commissionUser?.name || commissionUser?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Banco</p>
                        <p className="font-semibold">{commission.bank}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tipo</p>
                        <p className="font-semibold">{proposalType?.label}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Comissão</p>
                        <p className="font-semibold">{(commission.commissionPercentage / 100).toFixed(2)}%</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => deleteCommission.mutate({ id: commission.id })}
                          variant="destructive"
                          size="sm"
                          disabled={deleteCommission.isPending}
                        >
                          Deletar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600">Nenhuma comissão configurada.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
