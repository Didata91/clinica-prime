import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, DollarSign, TrendingUp, Clock, UserCheck } from "lucide-react";

const mockStats = {
  agendamentosHoje: 12,
  clientesTotal: 156,
  receitaMes: 28500,
  taxaOcupacao: 78,
  noShowMes: 5,
  atendimentosRealizados: 8
};

const mockAgendamentosHoje = [
  { id: 1, horario: "09:00", cliente: "Ana Silva", servico: "Botox 30U", profissional: "Dra. Maria", status: "confirmado" },
  { id: 2, horario: "10:30", cliente: "João Santos", servico: "Harmonização Facial", profissional: "Dra. Carla", status: "solicitado" },
  { id: 3, horario: "14:00", cliente: "Maria Oliveira", servico: "Preenchimento Labial", profissional: "Dra. Maria", status: "compareceu" },
  { id: 4, horario: "15:30", cliente: "Pedro Costa", servico: "Rinomodelação", profissional: "Dra. Carla", status: "confirmado" },
];

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
            <div className="text-2xl font-bold">{mockStats.agendamentosHoje}</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.atendimentosRealizados} realizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.clientesTotal}</div>
            <p className="text-xs text-muted-foreground">
              +12 este mês
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
              R$ {mockStats.receitaMes.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              +18% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Ocupação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.taxaOcupacao}%</div>
            <p className="text-xs text-muted-foreground">
              +5% vs semana anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No-Show Mês</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.noShowMes}</div>
            <p className="text-xs text-muted-foreground">
              -2 vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atendimentos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.atendimentosRealizados}</div>
            <p className="text-xs text-muted-foreground">
              de {mockStats.agendamentosHoje} agendados
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
          <div className="space-y-3">
            {mockAgendamentosHoje.map((agendamento) => (
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
        </CardContent>
      </Card>
    </div>
  );
}