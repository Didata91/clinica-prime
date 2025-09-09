import React, { useState, useCallback } from 'react';
import { Upload, FileText, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { type Agenda, type StatusAgenda, type FormaPagamento } from '@/hooks/useAgendas';

interface CsvRow {
  [key: string]: string;
}

interface ValidationError {
  linha: number;
  campo: string;
  valor: string;
  erro: string;
}

interface ProcessedRow {
  original: CsvRow;
  processed: Partial<Agenda>;
  errors: ValidationError[];
  isValid: boolean;
}

const statusMapping: Record<string, StatusAgenda> = {
  'agendado': 'agendado',
  'concluído': 'concluido',
  'concluido': 'concluido',
  'não compareceu': 'nao_compareceu',
  'nao compareceu': 'nao_compareceu',
  'cancelado': 'cancelado',
  'remarcado': 'remarcado'
};

const formaPagamentoMapping: Record<string, FormaPagamento> = {
  'pix': 'pix',
  'débito': 'debito',
  'debito': 'debito',
  'crédito': 'credito',
  'credito': 'credito',
  'dinheiro': 'dinheiro',
  'boleto': 'boleto',
  'transferência': 'transferencia',
  'transferencia': 'transferencia',
  'outro': 'outro'
};

export default function ImportarAgendas() {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    valid: 0,
    invalid: 0,
    imported: 0
  });

  const { toast } = useToast();

  const parseCsvText = (text: string): CsvRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(';').map(h => h.trim().replace(/"/g, ''));
    const rows: CsvRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(';').map(v => v.trim().replace(/"/g, ''));
      const row: CsvRow = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      rows.push(row);
    }
    
    return rows;
  };

  const parseDate = (dateStr: string): string | null => {
    if (!dateStr) return null;
    
    // Try DD/MM/YYYY format
    const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Try YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    return null;
  };

  const parseTime = (timeStr: string): string | null => {
    if (!timeStr) return '00:00';
    
    // Try HH:MM format
    if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
      const [hours, minutes] = timeStr.split(':');
      return `${hours.padStart(2, '0')}:${minutes}`;
    }
    
    return null;
  };

  const parseDecimal = (value: string): number => {
    if (!value) return 0;
    const cleaned = value.replace(',', '.').replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const normalizeColumnName = (name: string): string => {
    return name.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^\w]/g, '')
      .trim();
  };

  const processRow = (row: CsvRow, index: number): ProcessedRow => {
    const processed: Partial<Agenda> = {};
    const errors: ValidationError[] = [];
    
    // Normalizar nomes das colunas
    const normalizedRow: CsvRow = {};
    Object.entries(row).forEach(([key, value]) => {
      const normalizedKey = normalizeColumnName(key);
      normalizedRow[normalizedKey] = value;
    });

    // Mapear campos
    const mappings: Record<string, keyof Agenda> = {
      'data': 'data',
      'horario': 'horario',
      'nome': 'nome',
      'procedimento': 'procedimento',
      'valor_procedimento_padrao': 'valor_procedimento_padrao',
      'valor_cobrado': 'valor_cobrado',
      'desconto_aplicado': 'desconto_aplicado',
      'motivo_desconto': 'motivo_desconto',
      'status_agenda': 'status',
      'mls': 'mls',
      'sinal': 'sinal',
      'forma_de_pagamento': 'forma_pagamento'
    };

    // Processar cada campo
    Object.entries(mappings).forEach(([csvField, dbField]) => {
      const value = normalizedRow[csvField] || '';
      
      switch (dbField) {
        case 'data':
          const parsedDate = parseDate(value);
          if (parsedDate) {
            processed.data = parsedDate;
          } else if (value) {
            errors.push({
              linha: index + 2,
              campo: csvField,
              valor: value,
              erro: 'Data inválida. Use DD/MM/YYYY'
            });
          }
          break;
          
        case 'horario':
          const parsedTime = parseTime(value);
          if (parsedTime) {
            processed.horario = parsedTime;
          } else if (value) {
            errors.push({
              linha: index + 2,
              campo: csvField,
              valor: value,
              erro: 'Horário inválido. Use HH:MM'
            });
          } else {
            processed.horario = '00:00'; // Default
          }
          break;
          
        case 'nome':
        case 'procedimento':
        case 'motivo_desconto':
          processed[dbField] = value || '';
          break;
          
        case 'valor_procedimento_padrao':
        case 'valor_cobrado':
        case 'desconto_aplicado':
        case 'mls':
        case 'sinal':
          const numValue = parseDecimal(value);
          if (dbField === 'valor_procedimento_padrao' && numValue < 0) {
            errors.push({
              linha: index + 2,
              campo: csvField,
              valor: value,
              erro: 'Valor não pode ser negativo'
            });
          }
          processed[dbField] = numValue;
          break;
          
        case 'status':
          const status = statusMapping[value.toLowerCase()] || 'agendado';
          processed.status = status;
          break;
          
        case 'forma_pagamento':
          if (value) {
            const formaPag = formaPagamentoMapping[value.toLowerCase()];
            if (formaPag) {
              processed.forma_pagamento = formaPag;
            } else {
              processed.forma_pagamento = 'outro';
            }
          }
          break;
      }
    });

    // Validações obrigatórias
    if (!processed.data) {
      errors.push({
        linha: index + 2,
        campo: 'data',
        valor: normalizedRow['data'] || '',
        erro: 'Campo obrigatório'
      });
    }
    
    if (!processed.nome) {
      errors.push({
        linha: index + 2,
        campo: 'nome',
        valor: normalizedRow['nome'] || '',
        erro: 'Campo obrigatório'
      });
    }
    
    if (!processed.procedimento) {
      errors.push({
        linha: index + 2,
        campo: 'procedimento',
        valor: normalizedRow['procedimento'] || '',
        erro: 'Campo obrigatório'
      });
    }

    return {
      original: row,
      processed,
      errors,
      isValid: errors.length === 0
    };
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    
    if (!selectedFile) return;
    
    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione um arquivo CSV.',
        variant: 'destructive'
      });
      return;
    }

    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const data = parseCsvText(text);
      setCsvData(data);
    };
    reader.readAsText(selectedFile, 'UTF-8');
  };

  const processData = useCallback(() => {
    if (csvData.length === 0) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      const processed = csvData.map((row, index) => processRow(row, index));
      setProcessedData(processed);
      
      const newStats = {
        total: processed.length,
        valid: processed.filter(row => row.isValid).length,
        invalid: processed.filter(row => !row.isValid).length,
        imported: 0
      };
      setStats(newStats);
      
      setIsProcessing(false);
      
      toast({
        title: 'Processamento concluído',
        description: `${newStats.valid} linhas válidas, ${newStats.invalid} com erros.`
      });
    }, 1000);
  }, [csvData, toast]);

  const importData = async () => {
    const validRows = processedData.filter(row => row.isValid);
    if (validRows.length === 0) {
      toast({
        title: 'Nenhuma linha válida',
        description: 'Não há dados válidos para importar.',
        variant: 'destructive'
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    try {
      const batchSize = 50;
      let imported = 0;
      
      for (let i = 0; i < validRows.length; i += batchSize) {
        const batch = validRows.slice(i, i + batchSize);
        const dataToInsert = batch.map(row => row.processed);
        
        const { error } = await supabase
          .from('agendas')
          .insert(dataToInsert as any[]);
        
        if (error) {
          console.error('Erro no lote:', error);
          continue;
        }
        
        imported += batch.length;
        setImportProgress((imported / validRows.length) * 100);
        setStats(prev => ({ ...prev, imported }));
        
        // Pequena pausa para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      toast({
        title: 'Importação concluída',
        description: `${imported} agendas importadas com sucesso!`
      });
      
    } catch (error: any) {
      toast({
        title: 'Erro na importação',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadErrorReport = () => {
    const errors = processedData
      .filter(row => !row.isValid)
      .flatMap(row => row.errors);
    
    const csvContent = [
      'Linha,Campo,Valor,Erro',
      ...errors.map(error => 
        `${error.linha},"${error.campo}","${error.valor}","${error.erro}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'relatorio_erros.csv';
    link.click();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Importar Agendas</h1>
        <p className="text-muted-foreground">
          Faça upload de um arquivo CSV para importar agendas em lote
        </p>
      </div>

      {/* Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Selecionar Arquivo
          </CardTitle>
          <CardDescription>
            Arquivo CSV com separador ';' e encoding UTF-8
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Arquivo CSV</Label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
              />
            </div>
            
            {file && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm">{file.name}</span>
                <Badge variant="outline">{csvData.length} linhas</Badge>
              </div>
            )}

            {csvData.length > 0 && processedData.length === 0 && (
              <Button
                onClick={processData}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processando...' : 'Processar Dados'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      {processedData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Válidas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.valid}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Com Erros</p>
                  <p className="text-2xl font-bold text-red-600">{stats.invalid}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Importadas</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.imported}</p>
                </div>
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ações */}
      {processedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={importData}
                disabled={isImporting || stats.valid === 0}
              >
                {isImporting ? 'Importando...' : 'Importar Dados Válidos'}
              </Button>

              {stats.invalid > 0 && (
                <Button
                  variant="outline"
                  onClick={downloadErrorReport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Relatório de Erros
                </Button>
              )}
            </div>

            {isImporting && (
              <div className="mt-4">
                <Label>Progresso da Importação</Label>
                <Progress value={importProgress} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-1">
                  {stats.imported} de {stats.valid} importadas
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview dos dados */}
      {processedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview dos Dados</CardTitle>
            <CardDescription>
              Primeiras 50 linhas processadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Linha</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Procedimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Erros</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedData.slice(0, 50).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 2}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={row.isValid ? "default" : "destructive"}
                      >
                        {row.isValid ? 'Válida' : 'Erro'}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.processed.data || '-'}</TableCell>
                    <TableCell>{row.processed.horario || '-'}</TableCell>
                    <TableCell>{row.processed.nome || '-'}</TableCell>
                    <TableCell>{row.processed.procedimento || '-'}</TableCell>
                    <TableCell>
                      R$ {(row.processed.valor_procedimento_padrao || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {row.errors.length > 0 && (
                        <div className="text-xs">
                          {row.errors.map((error, i) => (
                            <div key={i} className="text-red-600">
                              {error.campo}: {error.erro}
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}