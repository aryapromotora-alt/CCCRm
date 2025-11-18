import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

export default function ProposalsList() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: proposals, isLoading, refetch } = trpc.proposals.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const deleteProposal = trpc.proposals.delete.useMutation({
    onSuccess: () => {
      toast.success("Proposta deletada com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar proposta");
    },
  });

  if (!isAuthenticated) {
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

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta proposta?")) {
      deleteProposal.mutate({ id });
    }
  };

  const commissionPercentage = proposals && proposals.length > 0 
    ? ((proposals[0].commission / proposals[0].value) * 100).toFixed(2)
    : "0.00";

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Propostas</h1>
            <p className="text-gray-600">Total: {proposals?.length || 0} proposta(s)</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => navigate("/proposals/new")}>
              Nova Proposta
            </Button>
            <Button onClick={() => navigate("/")} variant="outline">
              Voltar
            </Button>
          </div>
        </div>

        {proposals && proposals.length > 0 ? (
          <div className="grid gap-6">
            {proposals.map((proposal) => {
              const proposalCommissionPercentage = ((proposal.commission / proposal.value) * 100).toFixed(2);
              return (
                <Card key={proposal.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{proposal.proposalNumber}</CardTitle>
                        <p className="text-sm text-gray-600 mt-2">
                          Banco: {proposal.bank} | Tipo: {proposal.proposalType}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        proposal.status === 'ativo' ? 'bg-green-100 text-green-800' :
                        proposal.status === 'cancelado' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {proposal.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Valor</p>
                        <p className="text-lg font-semibold">R$ {(proposal.value / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Comissão</p>
                        <p className="text-lg font-semibold">R$ {(proposal.commission / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">% Comissão</p>
                        <p className="text-lg font-semibold text-blue-600">{proposalCommissionPercentage}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Parcelas</p>
                        <p className="text-lg font-semibold">{proposal.installments}x</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Data</p>
                        <p className="text-lg font-semibold">{new Date(proposal.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    {proposal.notes && (
                      <div className="mb-4 p-3 bg-gray-100 rounded">
                        <p className="text-sm text-gray-600">Observações</p>
                        <p className="text-gray-800">{proposal.notes}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => navigate(`/proposals/${proposal.id}/edit`)}
                        variant="outline"
                        size="sm"
                      >
                        Editar
                      </Button>
                      <Button 
                        onClick={() => handleDelete(proposal.id)}
                        variant="destructive"
                        size="sm"
                        disabled={deleteProposal.isPending}
                      >
                        Deletar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 mb-4">Nenhuma proposta cadastrada ainda.</p>
              <Button onClick={() => navigate("/proposals/new")}>
                Cadastrar Primeira Proposta
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
