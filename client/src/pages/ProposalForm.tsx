import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
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

export default function ProposalForm() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams();
  const proposalId = params.id ? parseInt(params.id) : null;

  const [formData, setFormData] = useState({
    proposalNumber: "",
    bank: "",
    proposalType: "novo",
    installments: 12,
    value: "",
    notes: "",
  });

  const [commissionPercentage, setCommissionPercentage] = useState(0);
  const [estimatedCommission, setEstimatedCommission] = useState(0);

  const { data: proposal } = trpc.proposals.get.useQuery(
    { id: proposalId! },
    { enabled: !!proposalId && isAuthenticated }
  );

  const { data: commissions } = trpc.commissions.listAll.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });

  useEffect(() => {
    if (proposal) {
      setFormData({
        proposalNumber: proposal.proposalNumber,
        bank: proposal.bank,
        proposalType: proposal.proposalType,
        installments: proposal.installments,
        value: (proposal.value / 100).toString(),
        notes: proposal.notes || "",
      });
    }
  }, [proposal]);

  useEffect(() => {
    if (user && formData.bank && formData.proposalType) {
      const commission = commissions?.find(
        c => c.userId === user.id && c.bank === formData.bank && c.proposalType === formData.proposalType
      );
      setCommissionPercentage(commission?.commissionPercentage || 0);
    }

    const value = parseFloat(formData.value) || 0;
    const commission = (value * (commissionPercentage / 10000));
    setEstimatedCommission(commission);
  }, [formData.bank, formData.proposalType, formData.value, commissionPercentage, commissions, user]);

  const createProposal = trpc.proposals.create.useMutation({
    onSuccess: () => {
      toast.success("Proposta cadastrada com sucesso!");
      navigate("/proposals");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao cadastrar proposta");
    },
  });

  const updateProposal = trpc.proposals.update.useMutation({
    onSuccess: () => {
      toast.success("Proposta atualizada com sucesso!");
      navigate("/proposals");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar proposta");
    },
  });

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const valueInCents = Math.round(parseFloat(formData.value) * 100);

    if (proposalId) {
      updateProposal.mutate({
        id: proposalId,
        proposalNumber: formData.proposalNumber,
        bank: formData.bank,
        proposalType: formData.proposalType as any,
        installments: formData.installments,
        value: valueInCents,
        notes: formData.notes,
      });
    } else {
      createProposal.mutate({
        proposalNumber: formData.proposalNumber,
        bank: formData.bank,
        proposalType: formData.proposalType as any,
        installments: formData.installments,
        value: valueInCents,
        notes: formData.notes,
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "installments" ? parseInt(value) : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {proposalId ? "Editar Proposta" : "Nova Proposta"}
          </h1>
          <p className="text-gray-600">Preencha os dados da proposta abaixo</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados da Proposta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número da Proposta *
                  </label>
                  <input
                    type="text"
                    name="proposalNumber"
                    value={formData.proposalNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: PROP-001"
                  />
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
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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
                    Número de Parcelas *
                  </label>
                  <input
                    type="number"
                    name="installments"
                    value={formData.installments}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="240"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor da Proposta (R$) *
                </label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-md">
                <div>
                  <p className="text-sm text-gray-600">Comissão (%)</p>
                  <p className="text-2xl font-bold text-blue-600">{(commissionPercentage / 100).toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Comissão Estimada (R$)</p>
                  <p className="text-2xl font-bold text-blue-600">R$ {estimatedCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Adicione observações sobre a proposta..."
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={createProposal.isPending || updateProposal.isPending}
                >
                  {proposalId ? "Atualizar" : "Cadastrar"} Proposta
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/proposals")}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
