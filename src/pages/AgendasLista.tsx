import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock,
  Copy,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  useAgendas, 
  type Agenda, 
  type StatusAgenda, 
  type FormaPagamento,
  type AgendaFilters 
} from '@/hooks/useAgendas';
import { toast } from '@/hooks/use-toast';

const statusLabels: Record<StatusAgenda, string> = {
  agendado: 'Agendado',
  concluido: 'Concluído',
  nao_compareceu: 'Não Compareceu',
  cancelado: 'Cancelado',
  remarcado: 'Remarcado'
};

const statusColors: Record<StatusAgenda, string> = {
  agendado: 'bg-blue-100 text-blue-800',
  concluido: 'bg-green-100 text-green-800',
  nao_compareceu: 'bg-red-100 text-red-800',
  cancelado: 'bg-gray-100 text-gray-800',
  remarcado: 'bg-yellow-100 text-yellow-800'
};

const formaPagamentoLabels: Record<FormaPagamento, string> = {
  pix: 'PIX',
  debito: 'Débito',
  credito: 'Crédito',
  dinheiro: 'Dinheiro',
  boleto: 'Boleto',
  transferencia: 'Transferência',
  outro: 'Outro'
};

export default function AgendasLista() {
  const [filters, setFilters] = useState<AgendaFilters>({});
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRemarcarDialog, setShowRemarcarDialog] = useState(false);
  const [novaData, setNovaData] = useState('');
  const [novoHorario, setNovoHorario] = useState('');

  const { 
    agendas, 
    isLoading, 
    deleteAgenda, 
    marcarConcluido, 
    remarcarAgenda,
    createAgenda 
  } = useAgendas(filters);

  const handleDelete = () => {
    if (selectedAgenda?.id) {
      deleteAgenda.mutate(selectedAgenda.id);
      setShowDeleteDialog(false);
      setSelectedAgenda(null);
    }
  };

  const handleMarcarConcluido = (agenda: Agenda) => {
    if (agenda.id) {
      marcarConcluido.mutate(agenda.id);
    }
  };

  const handleRemarcar = () => {
    if (selectedAgenda?.id && novaData && novoHorario) {
      remarcarAgenda.mutate({
        id: selectedAgenda.id,
        data: novaData,
        horario: novoHorario
      });
      setShowRemarcarDialog(false);
      setSelectedAgenda(null);
      setNovaData('');
      setNovoHorario('');
    }
  };

  const handleDuplicar = (agenda: Agenda) => {
    const { id, created_at, updated_at, ...agendaDuplicada } = agenda;
    createAgenda.mutate({
      ...agendaDuplicada,
      status: 'agendado'
    });
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Agendas</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todas as suas agendas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Agenda
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="data_inicio">Data Início</Label>
              <Input
                id="data_inicio"
                type="date"
                value={filters.data_inicio || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  data_inicio: e.target.value 
                }))}
              />
            </div>
            
            <div>
              <Label htmlFor="data_fim">Data Fim</Label>
              <Input
                id="data_fim"
                type="date"
                value={filters.data_fim || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  data_fim: e.target.value 
                }))}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  status: value as StatusAgenda || undefined
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="procedimento">Procedimento</Label>
              <Input
                id="procedimento"
                placeholder="Filtrar por procedimento..."
                value={filters.procedimento || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  procedimento: e.target.value 
                }))}
              />
            </div>

            <div>
              <Label htmlFor="forma_pagamento">Forma Pagamento</Label>
              <Select
                value={filters.forma_pagamento || ''}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  forma_pagamento: value as FormaPagamento || undefined
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {Object.entries(formaPagamentoLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Agendas ({agendas.length})</CardTitle>
          <CardDescription>
            Lista de todas as agendas com filtros aplicados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : agendas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma agenda encontrada
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Procedimento</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Faturamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agendas.map((agenda) => (
                  <TableRow key={agenda.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{formatDate(agenda.data)}</div>
                        <div className="text-sm text-muted-foreground">
                          {agenda.horario}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {agenda.nome}
                    </TableCell>
                    <TableCell>{agenda.procedimento}</TableCell>
                    <TableCell>
                      {agenda.forma_pagamento ? 
                        formaPagamentoLabels[agenda.forma_pagamento] : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {formatCurrency(agenda.faturamento_liquido)}
                        </div>
                        {agenda.desconto_aplicado > 0 && (
                          <div className="text-sm text-red-600">
                            Desconto: {formatCurrency(agenda.desconto_aplicado)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[agenda.status]}>
                        {statusLabels[agenda.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {agenda.status === 'agendado' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarcarConcluido(agenda)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAgenda(agenda);
                            setShowRemarcarDialog(true);
                          }}
                        >
                          <Clock className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDuplicar(agenda)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // TODO: Abrir modal de edição
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAgenda(agenda);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog para deletar */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta agenda? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteAgenda.isPending}
            >
              {deleteAgenda.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para remarcar */}
      <Dialog open={showRemarcarDialog} onOpenChange={setShowRemarcarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remarcar Agenda</DialogTitle>
            <DialogDescription>
              Selecione a nova data e horário para esta agenda.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="nova_data">Nova Data</Label>
              <Input
                id="nova_data"
                type="date"
                value={novaData}
                onChange={(e) => setNovaData(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="novo_horario">Novo Horário</Label>
              <Input
                id="novo_horario"
                type="time"
                value={novoHorario}
                onChange={(e) => setNovoHorario(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRemarcarDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRemarcar}
              disabled={remarcarAgenda.isPending || !novaData || !novoHorario}
            >
              {remarcarAgenda.isPending ? 'Remarcando...' : 'Remarcar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}