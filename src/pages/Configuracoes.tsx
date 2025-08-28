import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAppConfig } from "@/hooks/useAppConfig";
import { getWeekdayName } from "@/lib/scheduleUtils";
import { Trash2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Configuracoes = () => {
  const { config, scheduleWindows, loading, updateConfig, createScheduleWindow, updateScheduleWindow, deleteScheduleWindow } = useAppConfig();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWindow, setNewWindow] = useState({
    weekday: null as number | null,
    start_time: "08:00",
    end_time: "18:00",
    specific_date: null as string | null,
    is_blocked: false,
    notes: "",
  });

  const { toast } = useToast();

  const handleConfigSave = async (field: string, value: any) => {
    if (!config) return;
    
    try {
      await updateConfig({ [field]: value });
    } catch (error) {
      console.error("Error saving config:", error);
    }
  };

  const handleCreateWindow = async () => {
    try {
      await createScheduleWindow(newWindow);
      setNewWindow({
        weekday: null,
        start_time: "08:00",
        end_time: "18:00",
        specific_date: null,
        is_blocked: false,
        notes: "",
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating window:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Erro ao carregar configurações</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>

      <Tabs defaultValue="clinica" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="clinica">Clínica</TabsTrigger>
          <TabsTrigger value="funcionamento">Funcionamento</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="interface">Interface</TabsTrigger>
        </TabsList>

        <TabsContent value="clinica">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Clínica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="clinic_name">Nome da Clínica</Label>
                <Input
                  id="clinic_name"
                  value={config.clinic_name || ""}
                  onChange={(e) => handleConfigSave("clinic_name", e.target.value)}
                  onBlur={(e) => handleConfigSave("clinic_name", e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <Select 
                    value={config.timezone} 
                    onValueChange={(value) => handleConfigSave("timezone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">America/São Paulo</SelectItem>
                      <SelectItem value="America/Recife">America/Recife</SelectItem>
                      <SelectItem value="America/Manaus">America/Manaus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Moeda</Label>
                  <Select 
                    value={config.currency} 
                    onValueChange={(value) => handleConfigSave("currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">Real (R$)</SelectItem>
                      <SelectItem value="USD">Dólar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funcionamento">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Agendamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agenda_interval_minutes">Intervalo entre Agendamentos (minutos)</Label>
                  <Select 
                    value={config.agenda_interval_minutes.toString()} 
                    onValueChange={(value) => handleConfigSave("agenda_interval_minutes", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">60 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow_overbooking"
                    checked={config.allow_overbooking}
                    onCheckedChange={(checked) => handleConfigSave("allow_overbooking", checked)}
                  />
                  <Label htmlFor="allow_overbooking">Permitir Sobreposição de Horários</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agenda">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Janelas de Agendamento</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Janela
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nova Janela de Agendamento</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Dia da Semana</Label>
                          <Select 
                            value={newWindow.weekday?.toString() || ""} 
                            onValueChange={(value) => setNewWindow({...newWindow, weekday: value ? parseInt(value) : null})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o dia" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Domingo</SelectItem>
                              <SelectItem value="1">Segunda-feira</SelectItem>
                              <SelectItem value="2">Terça-feira</SelectItem>
                              <SelectItem value="3">Quarta-feira</SelectItem>
                              <SelectItem value="4">Quinta-feira</SelectItem>
                              <SelectItem value="5">Sexta-feira</SelectItem>
                              <SelectItem value="6">Sábado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Data Específica (opcional)</Label>
                          <Input
                            type="date"
                            value={newWindow.specific_date || ""}
                            onChange={(e) => setNewWindow({...newWindow, specific_date: e.target.value || null})}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Horário Início</Label>
                          <Input
                            type="time"
                            value={newWindow.start_time}
                            onChange={(e) => setNewWindow({...newWindow, start_time: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Horário Fim</Label>
                          <Input
                            type="time"
                            value={newWindow.end_time}
                            onChange={(e) => setNewWindow({...newWindow, end_time: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newWindow.is_blocked}
                          onCheckedChange={(checked) => setNewWindow({...newWindow, is_blocked: checked})}
                        />
                        <Label>Bloqueado (feriado/indisponível)</Label>
                      </div>
                      
                      <div>
                        <Label>Observações</Label>
                        <Input
                          value={newWindow.notes}
                          onChange={(e) => setNewWindow({...newWindow, notes: e.target.value})}
                          placeholder="Ex: Feriado nacional"
                        />
                      </div>
                      
                      <Button onClick={handleCreateWindow} className="w-full">
                        Criar Janela
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <p className="text-sm text-muted-foreground">
                Configure os horários e dias disponíveis para agendamentos
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {scheduleWindows.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma janela de agendamento configurada
                  </p>
                ) : (
                  scheduleWindows.map((window) => (
                    <div
                      key={window.id}
                      className={`flex items-center justify-between p-3 border rounded-lg ${
                        window.is_blocked ? 'bg-destructive/10 border-destructive/20' : 'bg-background'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {window.specific_date 
                            ? new Date(window.specific_date).toLocaleDateString('pt-BR')
                            : window.weekday !== null ? getWeekdayName(window.weekday) : 'Todos os dias'
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {window.start_time} - {window.end_time}
                          {window.is_blocked && ' (Bloqueado)'}
                          {window.notes && ` • ${window.notes}`}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteScheduleWindow(window.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interface">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Interface</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                As configurações de interface são aplicadas localmente no navegador.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuracoes;