import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, DollarSign, TrendingUp, Clock, UserCheck, Loader2 } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";

const getStatusColor = (status: string) => {
  const colors = {
    confirmado: "bg-blue-100 text-blue-800",
    solicitado: "bg-yellow-100 text-yellow-800", 
    compareceu: "bg-green-100 text-green-800",
    cancelado: "bg-red-100 text-red-800",
    faltou: "bg-gray-100 text-gray-800"
  };
  return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
};

export default function Dashboard() {
  const { stats, agendamentosHoje, loading } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Visão geral da sua clínica de estética
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agendamentosHoje}</div>
            <p className="text-xs text-muted-foreground">
              {stats.atendimentosRealizados} realizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clientesTotal}</div>
            <p className="text-xs text-muted-foreground">
              {stats.clientesTotal > 0 ? 'clientes cadastrados' : 'nenhum cliente cadastrado'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.receitaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              receita do mês atual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Ocupação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.taxaOcupacao}%</div>
            <p className="text-xs text-muted-foreground">
              taxa de comparecimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No-Show Mês</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.noShowMes}</div>
            <p className="text-xs text-muted-foreground">
              faltas no mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atendimentos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.atendimentosRealizados}</div>
            <p className="text-xs text-muted-foreground">
              de {stats.agendamentosHoje} agendados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agendamentos de Hoje */}
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          {agendamentosHoje.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum agendamento para hoje</p>
            </div>
          ) : (
            <div className="space-y-3">
              {agendamentosHoje.map((agendamento) => (
                <div
                  key={agendamento.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                      {agendamento.horario}
                    </div>
                    <div>
                      <p className="font-medium">{agendamento.cliente}</p>
                      <p className="text-sm text-muted-foreground">
                        {agendamento.servico} • {agendamento.profissional}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(agendamento.status)}>
                    {agendamento.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}