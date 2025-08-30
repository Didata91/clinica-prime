import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Mail, Phone, UserCheck, Clock, Calendar, Users, Edit2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfissionais } from "@/hooks/useProfissionais";
import { useProfissionaisAgenda } from "@/hooks/useProfissionaisAgenda";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const especialidadesDisponiveis = [
  "toxina_botulinica",
  "preenchimento", 
  "harmonizacao_facial",
  "rinomodelacao",
  "skinbooster",
  "peeling",
  "microagulhamento"
];

export default function Profissionais() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    periodo: 'semana' as 'hoje' | 'semana' | 'mes',
    servico_id: 'todos'
  });
  
  const { profissionais: profissionaisBasicos, loading, createProfissional, updateProfissional, toggleProfissionalStatus } = useProfissionais();
  const { profissionais: profissionaisComAgenda, loading: agendaLoading } = useProfissionaisAgenda(filtros);
  const [formData, setFormData] = useState({
    nome: "",
    conselho_registro: "",
    email: "",
    telefone: "",
    especialidades: [] as string[],
    horarios_atendimento: {
      segunda: { inicio: "", fim: "", naoAtende: false },
      terca: { inicio: "", fim: "", naoAtende: false },
      quarta: { inicio: "", fim: "", naoAtende: false },
      quinta: { inicio: "", fim: "", naoAtende: false },
      sexta: { inicio: "", fim: "", naoAtende: false },
      sabado: { inicio: "", fim: "", naoAtende: false },
      domingo: { inicio: "", fim: "", naoAtende: false }
    }
  });
  const { toast } = useToast();
  
  
  const filteredProfissionais = profissionaisComAgenda.filter(profissional =>
    profissional.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (profissional.conselho_registro && profissional.conselho_registro.toLowerCase().includes(searchTerm.toLowerCase())) ||
    profissional.especialidades.some(esp => esp.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEspecialidadeChange = (especialidade: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      especialidades: checked 
        ? [...prev.especialidades, especialidade]
        : prev.especialidades.filter(esp => esp !== especialidade)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const profissionalData = {
        nome: formData.nome,
        conselho_registro: formData.conselho_registro,
        especialidades: formData.especialidades,
        email: formData.email,
        telefone: formData.telefone,
        ativo: true,
        horarios_atendimento: Object.entries(formData.horarios_atendimento).reduce((acc, [dia, horario]) => {
          if (horario.naoAtende) {
            acc[dia] = "Não atende";
          } else if (horario.inicio && horario.fim) {
            acc[dia] = `${horario.inicio}-${horario.fim}`;
          }
          return acc;
        }, {} as any)
      };
      
      await createProfissional(profissionalData);
      
      setFormData({
        nome: "",
        conselho_registro: "",
        email: "",
        telefone: "",
        especialidades: [],
        horarios_atendimento: {
          segunda: { inicio: "", fim: "", naoAtende: false },
          terca: { inicio: "", fim: "", naoAtende: false },
          quarta: { inicio: "", fim: "", naoAtende: false },
          quinta: { inicio: "", fim: "", naoAtende: false },
          sexta: { inicio: "", fim: "", naoAtende: false },
          sabado: { inicio: "", fim: "", naoAtende: false },
          domingo: { inicio: "", fim: "", naoAtende: false }
        }
      });
      setIsDialogOpen(false);
    } catch (error) {
      // Error already handled by hook
    }
  };

  if (loading || agendaLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profissionais</h1>
            <p className="text-muted-foreground mt-2">Carregando profissionais...</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profissionais</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie a equipe médica da clínica
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Profissional
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Profissional</DialogTitle>
              <DialogDescription>
                Adicione um novo profissional à equipe médica
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome Completo *</label>
                  <Input 
                    placeholder="Dr(a). Nome Completo"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Registro Conselho</label>
                  <Input 
                    placeholder="CRM-SP 123456"
                    value={formData.conselho_registro}
                    onChange={(e) => setFormData(prev => ({ ...prev, conselho_registro: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input 
                    type="email" 
                    placeholder="email@clinica.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone</label>
                  <Input 
                    placeholder="(11) 99999-9999"
                    value={formData.telefone}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Especialidades</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {especialidadesDisponiveis.map(especialidade => (
                    <div key={especialidade} className="flex items-center space-x-2">
                      <Checkbox 
                        id={especialidade}
                        checked={formData.especialidades.includes(especialidade)}
                        onCheckedChange={(checked) => 
                          handleEspecialidadeChange(especialidade, checked as boolean)
                        }
                      />
                      <label htmlFor={especialidade} className="text-sm cursor-pointer">
                        {especialidade}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Horários de Atendimento</h3>
                <div className="grid grid-cols-1 gap-3">
                  {["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"].map((dia, index) => {
                    const diaLabel = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"][index];
                    return (
                      <div key={dia} className="flex items-center gap-4">
                        <div className="w-20 text-sm">{diaLabel}</div>
                        <Input 
                          type="time" 
                          className="w-24" 
                          placeholder="08:00"
                    value={formData.horarios_atendimento[dia]?.inicio || ""}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      horarios_atendimento: {
                        ...prev.horarios_atendimento,
                        [dia]: { ...prev.horarios_atendimento[dia], inicio: e.target.value }
                      }
                    }))}
                    disabled={formData.horarios_atendimento[dia]?.naoAtende || false}
                        />
                        <span className="text-sm">às</span>
                        <Input 
                          type="time" 
                          className="w-24" 
                          placeholder="18:00"
                    value={formData.horarios_atendimento[dia]?.fim || ""}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      horarios_atendimento: {
                        ...prev.horarios_atendimento,
                        [dia]: { ...prev.horarios_atendimento[dia], fim: e.target.value }
                      }
                    }))}
                    disabled={formData.horarios_atendimento[dia]?.naoAtende || false}
                        />
                        <label className="flex items-center gap-2">
                          <Checkbox
                            checked={formData.horarios_atendimento[dia]?.naoAtende || false}
                            onCheckedChange={(checked) => setFormData(prev => ({
                              ...prev,
                              horarios_atendimento: {
                                ...prev.horarios_atendimento,
                                [dia]: { ...prev.horarios_atendimento[dia], naoAtende: checked as boolean }
                              }
                            }))}
                          />
                          <span className="text-sm">Não atende</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                Salvar Profissional
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Lista de Profissionais</CardTitle>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome, registro ou especialidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Especialidades</TableHead>
                  <TableHead>Agenda Hoje</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfissionais.map((profissional) => (
                  <TableRow key={profissional.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{profissional.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {profissional.conselho_registro || 'Não informado'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {profissional.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            {profissional.email}
                          </div>
                        )}
                        {profissional.telefone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {profissional.telefone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {profissional.especialidades.slice(0, 2).map(esp => (
                          <Badge key={esp} variant="secondary" className="text-xs">
                            {esp}
                          </Badge>
                        ))}
                        {profissional.especialidades.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{profissional.especialidades.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                     <TableCell>
                       <div className="flex items-center gap-2">
                         <Calendar className="h-4 w-4 text-muted-foreground" />
                         <span className="text-sm">{profissional.countHoje} hoje / {profissional.countSemana} semana</span>
                       </div>
                     </TableCell>
                    <TableCell>
                      <Badge variant={profissional.ativo ? "default" : "secondary"}>
                        {profissional.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Clock className="h-3 w-3 mr-1" />
                          Agenda
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toggleProfissionalStatus(profissional.id, !profissional.ativo)}>
                          {profissional.ativo ? "Desativar" : "Ativar"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Cards com resumo dos profissionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfissionais.map(profissional => (
          <Card key={profissional.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{profissional.nome}</CardTitle>
                  <p className="text-sm text-muted-foreground">{profissional.conselho_registro || 'Não informado'}</p>
                </div>
                <Badge variant={profissional.ativo ? "default" : "secondary"}>
                  {profissional.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Especialidades</h4>
                  <div className="flex flex-wrap gap-1">
                    {profissional.especialidades.map(esp => (
                      <Badge key={esp} variant="outline" className="text-xs">
                        {esp}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                 <div>
                   <h4 className="text-sm font-medium mb-2">Próximos Atendimentos</h4>
                   <div className="space-y-2">
                     {profissional.proximosAtendimentos.length > 0 ? (
                       profissional.proximosAtendimentos.slice(0, 3).map((atendimento, idx) => (
                         <div key={idx} className="flex items-center justify-between text-sm">
                           <div>
                             <p className="font-medium">{atendimento.cliente_nome}</p>
                             <p className="text-xs text-muted-foreground">
                               {atendimento.servico_nome}
                             </p>
                           </div>
                           <div className="text-right">
                             <p className="text-xs">
                               {format(new Date(atendimento.data_hora_inicio), 'dd/MM', { locale: ptBR })}
                             </p>
                             <p className="text-xs text-muted-foreground">
                               {format(new Date(atendimento.data_hora_inicio), 'HH:mm', { locale: ptBR })}
                             </p>
                           </div>
                         </div>
                       ))
                     ) : (
                       <div className="flex items-center gap-2">
                         <Users className="h-4 w-4 text-muted-foreground" />
                         <span className="text-sm text-muted-foreground">Nenhum atendimento próximo</span>
                       </div>
                     )}
                   </div>
                 </div>

                 <div className="flex gap-2 pt-2">
                   <Button variant="outline" size="sm">
                     <Eye className="h-3 w-3 mr-1" />
                     Ver Agenda
                   </Button>
                   {profissional.proximosAtendimentos.length > 0 && (
                     <Button variant="outline" size="sm">
                       <Edit2 className="h-3 w-3 mr-1" />
                       Editar
                     </Button>
                   )}
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}