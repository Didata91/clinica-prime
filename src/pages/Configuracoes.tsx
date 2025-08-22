import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Building, 
  Palette,
  Clock,
  Mail,
  Phone,
  MapPin,
  Save,
  Users,
  Calendar,
  DollarSign,
  Database,
  Download,
  Upload
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

export default function Configuracoes() {
  const [configuracoes, setConfiguracoes] = useState({
    // Dados da clínica
    nomeClinica: "Clínica Prime Estética",
    cnpj: "12.345.678/0001-90",
    telefone: "(11) 99999-9999",
    email: "contato@clinicaprime.com.br",
    endereco: "Rua das Flores, 123 - Centro",
    cidade: "São Paulo",
    uf: "SP",
    cep: "01234-567",
    
    // Configurações de funcionamento
    horarioInicio: "08:00",
    horarioFim: "18:00",
    intervaloAgendamento: 30,
    diasFuncionamento: ["segunda", "terca", "quarta", "quinta", "sexta", "sabado"],
    
    // Notificações
    notificarNovosAgendamentos: true,
    notificarCancelamentos: true,
    notificarLembretes: true,
    enviarLembreteCliente: true,
    antecedenciaLembrete: 24,
    
    // Configurações financeiras
    taxaCartaoCredito: 3.5,
    taxaCartaoDebito: 2.0,
    descontoAVista: 10,
    permiteParcelamento: true,
    maxParcelas: 6,
    
    // Configurações de segurança
    senhaObrigatoria: true,
    sessaoExpira: 480, // 8 horas em minutos
    logAcoes: true,
    backupAutomatico: true,
    
    // Configurações de interface
    temaEscuro: false,
    idioma: "pt-BR",
    mostrarFotos: true,
    compactarInterface: false
  });

  const handleSave = () => {
    console.log("Configurações salvas:", configuracoes);
    // Aqui seria feita a chamada para salvar no backend
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-2">
            Configure as preferências e parâmetros do sistema
          </p>
        </div>
        
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Alterações
        </Button>
      </div>

      <Tabs defaultValue="clinica" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="clinica">Clínica</TabsTrigger>
          <TabsTrigger value="funcionamento">Funcionamento</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="interface">Interface</TabsTrigger>
        </TabsList>
        
        <TabsContent value="clinica" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Dados da Clínica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeClinica">Nome da Clínica</Label>
                  <Input
                    id="nomeClinica"
                    value={configuracoes.nomeClinica}
                    onChange={(e) => setConfiguracoes({...configuracoes, nomeClinica: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={configuracoes.cnpj}
                    onChange={(e) => setConfiguracoes({...configuracoes, cnpj: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <div className="flex">
                    <Phone className="h-4 w-4 mt-3 mr-2 text-muted-foreground" />
                    <Input
                      id="telefone"
                      value={configuracoes.telefone}
                      onChange={(e) => setConfiguracoes({...configuracoes, telefone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="flex">
                    <Mail className="h-4 w-4 mt-3 mr-2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={configuracoes.email}
                      onChange={(e) => setConfiguracoes({...configuracoes, email: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="endereco">Logradouro</Label>
                    <Input
                      id="endereco"
                      value={configuracoes.endereco}
                      onChange={(e) => setConfiguracoes({...configuracoes, endereco: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      value={configuracoes.cep}
                      onChange={(e) => setConfiguracoes({...configuracoes, cep: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={configuracoes.cidade}
                      onChange={(e) => setConfiguracoes({...configuracoes, cidade: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="uf">UF</Label>
                    <select 
                      id="uf"
                      className="w-full p-2 border rounded-md"
                      value={configuracoes.uf}
                      onChange={(e) => setConfiguracoes({...configuracoes, uf: e.target.value})}
                    >
                      <option value="SP">São Paulo</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="RS">Rio Grande do Sul</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funcionamento" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horários de Funcionamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horarioInicio">Horário de Abertura</Label>
                  <Input
                    id="horarioInicio"
                    type="time"
                    value={configuracoes.horarioInicio}
                    onChange={(e) => setConfiguracoes({...configuracoes, horarioInicio: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horarioFim">Horário de Fechamento</Label>
                  <Input
                    id="horarioFim"
                    type="time"
                    value={configuracoes.horarioFim}
                    onChange={(e) => setConfiguracoes({...configuracoes, horarioFim: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="intervalo">Intervalo entre Agendamentos (min)</Label>
                  <select 
                    id="intervalo"
                    className="w-full p-2 border rounded-md"
                    value={configuracoes.intervaloAgendamento}
                    onChange={(e) => setConfiguracoes({...configuracoes, intervaloAgendamento: Number(e.target.value)})}
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Dias de Funcionamento</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: "segunda", label: "Segunda-feira" },
                    { key: "terca", label: "Terça-feira" },
                    { key: "quarta", label: "Quarta-feira" },
                    { key: "quinta", label: "Quinta-feira" },
                    { key: "sexta", label: "Sexta-feira" },
                    { key: "sabado", label: "Sábado" },
                    { key: "domingo", label: "Domingo" }
                  ].map((dia) => (
                    <div key={dia.key} className="flex items-center space-x-2">
                      <Switch
                        id={dia.key}
                        checked={configuracoes.diasFuncionamento.includes(dia.key)}
                        onCheckedChange={(checked) => {
                          const novosDias = checked 
                            ? [...configuracoes.diasFuncionamento, dia.key]
                            : configuracoes.diasFuncionamento.filter(d => d !== dia.key);
                          setConfiguracoes({...configuracoes, diasFuncionamento: novosDias});
                        }}
                      />
                      <Label htmlFor={dia.key}>{dia.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configurações de Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notificações do Sistema</h3>
                <div className="space-y-4">
                  {[
                    { key: "notificarNovosAgendamentos", label: "Novos agendamentos", desc: "Receber notificação quando um novo agendamento for criado" },
                    { key: "notificarCancelamentos", label: "Cancelamentos", desc: "Notificar sobre cancelamentos de consultas" },
                    { key: "notificarLembretes", label: "Lembretes de consulta", desc: "Ativar sistema de lembretes automáticos" }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={configuracoes[item.key as keyof typeof configuracoes] as boolean}
                        onCheckedChange={(checked) => setConfiguracoes({...configuracoes, [item.key]: checked})}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Lembretes para Clientes</h3>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Enviar lembrete por WhatsApp</p>
                    <p className="text-sm text-muted-foreground">Enviar mensagens automáticas de lembrete</p>
                  </div>
                  <Switch
                    checked={configuracoes.enviarLembreteCliente}
                    onCheckedChange={(checked) => setConfiguracoes({...configuracoes, enviarLembreteCliente: checked})}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="antecedencia">Antecedência do Lembrete</Label>
                    <select 
                      id="antecedencia"
                      className="w-full p-2 border rounded-md"
                      value={configuracoes.antecedenciaLembrete}
                      onChange={(e) => setConfiguracoes({...configuracoes, antecedenciaLembrete: Number(e.target.value)})}
                    >
                      <option value={2}>2 horas antes</option>
                      <option value={6}>6 horas antes</option>
                      <option value={12}>12 horas antes</option>
                      <option value={24}>24 horas antes</option>
                      <option value={48}>48 horas antes</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Configurações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Taxas de Pagamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxaCredito">Taxa Cartão de Crédito (%)</Label>
                    <Input
                      id="taxaCredito"
                      type="number"
                      step="0.1"
                      value={configuracoes.taxaCartaoCredito}
                      onChange={(e) => setConfiguracoes({...configuracoes, taxaCartaoCredito: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxaDebito">Taxa Cartão de Débito (%)</Label>
                    <Input
                      id="taxaDebito"
                      type="number"
                      step="0.1"
                      value={configuracoes.taxaCartaoDebito}
                      onChange={(e) => setConfiguracoes({...configuracoes, taxaCartaoDebito: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Descontos e Parcelamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="descontoVista">Desconto à Vista (%)</Label>
                    <Input
                      id="descontoVista"
                      type="number"
                      step="0.1"
                      value={configuracoes.descontoAVista}
                      onChange={(e) => setConfiguracoes({...configuracoes, descontoAVista: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxParcelas">Máximo de Parcelas</Label>
                    <select 
                      id="maxParcelas"
                      className="w-full p-2 border rounded-md"
                      value={configuracoes.maxParcelas}
                      onChange={(e) => setConfiguracoes({...configuracoes, maxParcelas: Number(e.target.value)})}
                    >
                      <option value={1}>À vista apenas</option>
                      <option value={2}>Até 2x</option>
                      <option value={3}>Até 3x</option>
                      <option value={6}>Até 6x</option>
                      <option value={12}>Até 12x</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Permitir Parcelamento</p>
                    <p className="text-sm text-muted-foreground">Habilitar pagamento parcelado nos serviços</p>
                  </div>
                  <Switch
                    checked={configuracoes.permiteParcelamento}
                    onCheckedChange={(checked) => setConfiguracoes({...configuracoes, permiteParcelamento: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { key: "senhaObrigatoria", label: "Senha Obrigatória", desc: "Exigir autenticação para acessar o sistema" },
                  { key: "logAcoes", label: "Log de Ações", desc: "Registrar todas as ações dos usuários para auditoria" },
                  { key: "backupAutomatico", label: "Backup Automático", desc: "Realizar backup automático dos dados diariamente" }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={configuracoes[item.key as keyof typeof configuracoes] as boolean}
                      onCheckedChange={(checked) => setConfiguracoes({...configuracoes, [item.key]: checked})}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Configurações Avançadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessaoExpira">Tempo de Expiração da Sessão (minutos)</Label>
                    <select 
                      id="sessaoExpira"
                      className="w-full p-2 border rounded-md"
                      value={configuracoes.sessaoExpira}
                      onChange={(e) => setConfiguracoes({...configuracoes, sessaoExpira: Number(e.target.value)})}
                    >
                      <option value={60}>1 hora</option>
                      <option value={240}>4 horas</option>
                      <option value={480}>8 horas</option>
                      <option value={1440}>24 horas</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Backup e Restauração</h3>
                <div className="flex gap-4">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Fazer Backup
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Restaurar Backup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interface" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Configurações de Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { key: "temaEscuro", label: "Tema Escuro", desc: "Utilizar modo escuro na interface" },
                  { key: "mostrarFotos", label: "Mostrar Fotos", desc: "Exibir fotos dos procedimentos nos prontuários" },
                  { key: "compactarInterface", label: "Interface Compacta", desc: "Reduzir espaçamentos para mostrar mais informações" }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={configuracoes[item.key as keyof typeof configuracoes] as boolean}
                      onCheckedChange={(checked) => setConfiguracoes({...configuracoes, [item.key]: checked})}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idioma">Idioma do Sistema</Label>
                  <select 
                    id="idioma"
                    className="w-full p-2 border rounded-md"
                    value={configuracoes.idioma}
                    onChange={(e) => setConfiguracoes({...configuracoes, idioma: e.target.value})}
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}