export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      agendamento_servicos: {
        Row: {
          agendamento_id: string
          created_at: string
          desconto_motivo: string | null
          id: number
          minutos: number | null
          ordem: number
          servico_id: string
          valor_aplicado: number | null
          valor_padrao: number | null
        }
        Insert: {
          agendamento_id: string
          created_at?: string
          desconto_motivo?: string | null
          id?: number
          minutos?: number | null
          ordem?: number
          servico_id: string
          valor_aplicado?: number | null
          valor_padrao?: number | null
        }
        Update: {
          agendamento_id?: string
          created_at?: string
          desconto_motivo?: string | null
          id?: number
          minutos?: number | null
          ordem?: number
          servico_id?: string
          valor_aplicado?: number | null
          valor_padrao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamento_servicos_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamento_servicos_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "v_agendamentos_detalhe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamento_servicos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      agendamento_status: {
        Row: {
          id: string
          nome: string
          ordem: number
        }
        Insert: {
          id: string
          nome: string
          ordem: number
        }
        Update: {
          id?: string
          nome?: string
          ordem?: number
        }
        Relationships: []
      }
      agendamentos: {
        Row: {
          cliente_id: string
          created_at: string
          created_by: string | null
          data_hora_fim: string
          data_hora_inicio: string
          id: string
          lembrete_enviado_em: string | null
          observacoes: string | null
          origem: Database["public"]["Enums"]["origem_agendamento_enum"]
          politica_cancelamento_aceita: boolean
          profissional_id: string
          sala_id: string | null
          servico_id: string | null
          servicos: Json | null
          status: Database["public"]["Enums"]["status_agendamento_enum"]
          status_id: string | null
          updated_at: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          created_by?: string | null
          data_hora_fim: string
          data_hora_inicio: string
          id?: string
          lembrete_enviado_em?: string | null
          observacoes?: string | null
          origem?: Database["public"]["Enums"]["origem_agendamento_enum"]
          politica_cancelamento_aceita?: boolean
          profissional_id: string
          sala_id?: string | null
          servico_id?: string | null
          servicos?: Json | null
          status?: Database["public"]["Enums"]["status_agendamento_enum"]
          status_id?: string | null
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          created_by?: string | null
          data_hora_fim?: string
          data_hora_inicio?: string
          id?: string
          lembrete_enviado_em?: string | null
          observacoes?: string | null
          origem?: Database["public"]["Enums"]["origem_agendamento_enum"]
          politica_cancelamento_aceita?: boolean
          profissional_id?: string
          sala_id?: string | null
          servico_id?: string | null
          servicos?: Json | null
          status?: Database["public"]["Enums"]["status_agendamento_enum"]
          status_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_sala_id_fkey"
            columns: ["sala_id"]
            isOneToOne: false
            referencedRelation: "salas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "agendamento_status"
            referencedColumns: ["id"]
          },
        ]
      }
      app_config: {
        Row: {
          agenda_interval_minutes: number
          allow_overbooking: boolean
          clinic_name: string | null
          currency: string
          id: number
          timezone: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          agenda_interval_minutes?: number
          allow_overbooking?: boolean
          clinic_name?: string | null
          currency?: string
          id?: never
          timezone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          agenda_interval_minutes?: number
          allow_overbooking?: boolean
          clinic_name?: string | null
          currency?: string
          id?: never
          timezone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      app_schedule_windows: {
        Row: {
          end_time: string
          id: number
          is_blocked: boolean
          notes: string | null
          specific_date: string | null
          start_time: string
          updated_at: string
          updated_by: string | null
          weekday: number | null
        }
        Insert: {
          end_time: string
          id?: never
          is_blocked?: boolean
          notes?: string | null
          specific_date?: string | null
          start_time: string
          updated_at?: string
          updated_by?: string | null
          weekday?: number | null
        }
        Update: {
          end_time?: string
          id?: never
          is_blocked?: boolean
          notes?: string | null
          specific_date?: string | null
          start_time?: string
          updated_at?: string
          updated_by?: string | null
          weekday?: number | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          alergias: string | null
          bairro: string | null
          best_contact_period: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          consentimento_lgpd: boolean
          cpf_cnpj: string | null
          created_at: string
          created_by: string | null
          data_nascimento: string | null
          email: string | null
          id: string
          instagram: string | null
          instagram_handle: string | null
          logradouro: string | null
          medicamentos_uso: string | null
          nome_completo: string
          notes: string | null
          numero: string | null
          observacoes: string | null
          referral_source: string | null
          sexo: Database["public"]["Enums"]["sexo_enum"] | null
          submission_ts: string | null
          telefone: string
          termo_consentimento_assinado_em: string | null
          uf: string | null
          updated_at: string
        }
        Insert: {
          alergias?: string | null
          bairro?: string | null
          best_contact_period?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          consentimento_lgpd?: boolean
          cpf_cnpj?: string | null
          created_at?: string
          created_by?: string | null
          data_nascimento?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          instagram_handle?: string | null
          logradouro?: string | null
          medicamentos_uso?: string | null
          nome_completo: string
          notes?: string | null
          numero?: string | null
          observacoes?: string | null
          referral_source?: string | null
          sexo?: Database["public"]["Enums"]["sexo_enum"] | null
          submission_ts?: string | null
          telefone: string
          termo_consentimento_assinado_em?: string | null
          uf?: string | null
          updated_at?: string
        }
        Update: {
          alergias?: string | null
          bairro?: string | null
          best_contact_period?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          consentimento_lgpd?: boolean
          cpf_cnpj?: string | null
          created_at?: string
          created_by?: string | null
          data_nascimento?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          instagram_handle?: string | null
          logradouro?: string | null
          medicamentos_uso?: string | null
          nome_completo?: string
          notes?: string | null
          numero?: string | null
          observacoes?: string | null
          referral_source?: string | null
          sexo?: Database["public"]["Enums"]["sexo_enum"] | null
          submission_ts?: string | null
          telefone?: string
          termo_consentimento_assinado_em?: string | null
          uf?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      logs_auditoria: {
        Row: {
          acao: string
          delta: Json | null
          entidade: string
          entidade_id: string
          id: string
          por_usuario_id: string | null
          timestamp: string
        }
        Insert: {
          acao: string
          delta?: Json | null
          entidade: string
          entidade_id: string
          id?: string
          por_usuario_id?: string | null
          timestamp?: string
        }
        Update: {
          acao?: string
          delta?: Json | null
          entidade?: string
          entidade_id?: string
          id?: string
          por_usuario_id?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "logs_auditoria_por_usuario_id_fkey"
            columns: ["por_usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          agendamento_id: string
          created_at: string
          data_pagamento: string | null
          forma: Database["public"]["Enums"]["forma_pagamento_enum"]
          id: string
          status: Database["public"]["Enums"]["status_pagamento_enum"]
          transacao_externa_id: string | null
          updated_at: string
          valor: number
        }
        Insert: {
          agendamento_id: string
          created_at?: string
          data_pagamento?: string | null
          forma: Database["public"]["Enums"]["forma_pagamento_enum"]
          id?: string
          status?: Database["public"]["Enums"]["status_pagamento_enum"]
          transacao_externa_id?: string | null
          updated_at?: string
          valor: number
        }
        Update: {
          agendamento_id?: string
          created_at?: string
          data_pagamento?: string | null
          forma?: Database["public"]["Enums"]["forma_pagamento_enum"]
          id?: string
          status?: Database["public"]["Enums"]["status_pagamento_enum"]
          transacao_externa_id?: string | null
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "v_agendamentos_detalhe"
            referencedColumns: ["id"]
          },
        ]
      }
      profissionais: {
        Row: {
          ativo: boolean
          bloqueios_agenda: Json | null
          conselho_registro: string | null
          created_at: string
          email: string | null
          especialidades:
            | Database["public"]["Enums"]["especialidade_enum"][]
            | null
          horarios_atendimento: Json | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          bloqueios_agenda?: Json | null
          conselho_registro?: string | null
          created_at?: string
          email?: string | null
          especialidades?:
            | Database["public"]["Enums"]["especialidade_enum"][]
            | null
          horarios_atendimento?: Json | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          bloqueios_agenda?: Json | null
          conselho_registro?: string | null
          created_at?: string
          email?: string | null
          especialidades?:
            | Database["public"]["Enums"]["especialidade_enum"][]
            | null
          horarios_atendimento?: Json | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prontuarios: {
        Row: {
          agendamento_id: string
          anamnese: Json | null
          assinatura_digital_paciente: string | null
          assinatura_profissional: string | null
          created_at: string
          data_finalizacao: string | null
          fotos_antes: string[] | null
          fotos_depois: string[] | null
          id: string
          lote_validade: string | null
          observacoes: string | null
          produtos_utilizados: string | null
          quantidade_unidades: number | null
          updated_at: string
        }
        Insert: {
          agendamento_id: string
          anamnese?: Json | null
          assinatura_digital_paciente?: string | null
          assinatura_profissional?: string | null
          created_at?: string
          data_finalizacao?: string | null
          fotos_antes?: string[] | null
          fotos_depois?: string[] | null
          id?: string
          lote_validade?: string | null
          observacoes?: string | null
          produtos_utilizados?: string | null
          quantidade_unidades?: number | null
          updated_at?: string
        }
        Update: {
          agendamento_id?: string
          anamnese?: Json | null
          assinatura_digital_paciente?: string | null
          assinatura_profissional?: string | null
          created_at?: string
          data_finalizacao?: string | null
          fotos_antes?: string[] | null
          fotos_depois?: string[] | null
          id?: string
          lote_validade?: string | null
          observacoes?: string | null
          produtos_utilizados?: string | null
          quantidade_unidades?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prontuarios_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prontuarios_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "v_agendamentos_detalhe"
            referencedColumns: ["id"]
          },
        ]
      }
      salas: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          tipo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          tipo?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      sensitive_data_access_log: {
        Row: {
          access_type: string
          accessed_at: string
          id: string
          ip_address: unknown | null
          record_id: string
          table_name: string
          user_agent: string | null
          user_id: string
          user_role: string | null
        }
        Insert: {
          access_type: string
          accessed_at?: string
          id?: string
          ip_address?: unknown | null
          record_id: string
          table_name: string
          user_agent?: string | null
          user_id: string
          user_role?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string
          id?: string
          ip_address?: unknown | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
          user_id?: string
          user_role?: string | null
        }
        Relationships: []
      }
      servicos: {
        Row: {
          ativo: boolean
          categoria: Database["public"]["Enums"]["categoria_servico_enum"]
          contra_indicacoes: string | null
          created_at: string
          cuidados_pos: string | null
          cuidados_pre: string | null
          duracao_minutos: number
          exige_avaliacao_previa: boolean
          id: string
          nome: string
          preco_base: number
          preco_padrao: number | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categoria: Database["public"]["Enums"]["categoria_servico_enum"]
          contra_indicacoes?: string | null
          created_at?: string
          cuidados_pos?: string | null
          cuidados_pre?: string | null
          duracao_minutos: number
          exige_avaliacao_previa?: boolean
          id?: string
          nome: string
          preco_base?: number
          preco_padrao?: number | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categoria?: Database["public"]["Enums"]["categoria_servico_enum"]
          contra_indicacoes?: string | null
          created_at?: string
          cuidados_pos?: string | null
          cuidados_pre?: string | null
          duracao_minutos?: number
          exige_avaliacao_previa?: boolean
          id?: string
          nome?: string
          preco_base?: number
          preco_padrao?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          ativo: boolean
          conteudo: string
          created_at: string
          id: string
          nome: string
          tipo: Database["public"]["Enums"]["tipo_template_enum"]
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          conteudo: string
          created_at?: string
          id?: string
          nome: string
          tipo: Database["public"]["Enums"]["tipo_template_enum"]
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          conteudo?: string
          created_at?: string
          id?: string
          nome?: string
          tipo?: Database["public"]["Enums"]["tipo_template_enum"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          id: string
          nome: string
          perfil: Database["public"]["Enums"]["perfil_usuario_enum"]
          senha_hash: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          id?: string
          nome: string
          perfil?: Database["public"]["Enums"]["perfil_usuario_enum"]
          senha_hash: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          id?: string
          nome?: string
          perfil?: Database["public"]["Enums"]["perfil_usuario_enum"]
          senha_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_agendamentos_detalhe: {
        Row: {
          cliente_id: string | null
          cliente_nome: string | null
          created_at: string | null
          data_hora_fim: string | null
          data_hora_inicio: string | null
          duracao_total_min: number | null
          id: string | null
          observacoes: string | null
          profissional_id: string | null
          profissional_nome: string | null
          servicos_nomes: string[] | null
          status_id: string | null
          status_nome: string | null
          updated_at: string | null
          valor_total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      can_access_client: {
        Args: { client_uuid: string; user_uuid: string }
        Returns: boolean
      }
      current_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_agendamentos_detalhe: {
        Args: { target_date?: string }
        Returns: {
          cliente_id: string
          cliente_nome: string
          created_at: string
          data_hora_fim: string
          data_hora_inicio: string
          duracao_minutos: number
          id: string
          observacoes: string
          profissional_id: string
          profissional_nome: string
          sala_id: string
          servico_id: string
          servico_nome: string
          status: Database["public"]["Enums"]["status_agendamento_enum"]
          updated_at: string
        }[]
      }
      get_clientes_basic: {
        Args: Record<PropertyKey, never>
        Returns: {
          alergias: string
          bairro: string
          cep: string
          cidade: string
          complemento: string
          consentimento_lgpd: boolean
          cpf_cnpj: string
          created_at: string
          data_nascimento: string
          email: string
          id: string
          instagram: string
          logradouro: string
          medicamentos_uso: string
          nome_completo: string
          numero: string
          observacoes: string
          sexo: Database["public"]["Enums"]["sexo_enum"]
          telefone: string
          termo_consentimento_assinado_em: string
          uf: string
          updated_at: string
        }[]
      }
      get_pagamentos_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          agendamento_id: string
          created_at: string
          data_pagamento: string
          forma: Database["public"]["Enums"]["forma_pagamento_enum"]
          id: string
          status: Database["public"]["Enums"]["status_pagamento_enum"]
          transacao_externa_id: string
          valor: number
        }[]
      }
      get_prontuarios_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          agendamento_id: string
          anamnese: Json
          assinatura_digital_paciente: string
          assinatura_profissional: string
          created_at: string
          data_finalizacao: string
          fotos_antes: string[]
          fotos_depois: string[]
          id: string
          lote_validade: string
          observacoes: string
          produtos_utilizados: string
          quantidade_unidades: number
          updated_at: string
        }[]
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_usuarios_safe: {
        Args: Record<PropertyKey, never>
        Returns: {
          ativo: boolean
          created_at: string
          email: string
          id: string
          nome: string
          perfil: Database["public"]["Enums"]["perfil_usuario_enum"]
          updated_at: string
        }[]
      }
      has_role: {
        Args: {
          required_role: Database["public"]["Enums"]["app_role"]
          user_uuid: string
        }
        Returns: boolean
      }
      log_sensitive_access: {
        Args: { access_type: string; entity_id: string; entity_type: string }
        Returns: undefined
      }
      log_sensitive_data_access: {
        Args: { access_type?: string; record_id: string; table_name: string }
        Returns: undefined
      }
      norm_instagram: {
        Args: { p: string }
        Returns: string
      }
      only_digits: {
        Args: { p: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "recepcao" | "profissional" | "financeiro"
      categoria_servico_enum:
        | "toxina"
        | "preenchimento"
        | "avaliacao"
        | "pos"
        | "outros"
        | "limpeza"
        | "microagulhamento"
      especialidade_enum:
        | "toxina_botulinica"
        | "preenchimento"
        | "rinomodelacao"
        | "peeling"
        | "skinbooster"
        | "harmonizacao_facial"
        | "limpeza_pele"
        | "microagulhamento"
      forma_pagamento_enum: "pix" | "cartao" | "dinheiro" | "transferencia"
      origem_agendamento_enum: "recepcao" | "online" | "whatsapp"
      perfil_usuario_enum:
        | "admin"
        | "recepcao"
        | "profissional"
        | "financeiro"
        | "gestor"
      sexo_enum: "feminino" | "masculino" | "outro" | "nao_informar"
      status_agendamento_enum:
        | "solicitado"
        | "confirmado"
        | "compareceu"
        | "faltou"
        | "cancelado"
      status_pagamento_enum: "pendente" | "pago" | "estornado"
      tipo_template_enum: "whatsapp" | "email" | "termo"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "recepcao", "profissional", "financeiro"],
      categoria_servico_enum: [
        "toxina",
        "preenchimento",
        "avaliacao",
        "pos",
        "outros",
        "limpeza",
        "microagulhamento",
      ],
      especialidade_enum: [
        "toxina_botulinica",
        "preenchimento",
        "rinomodelacao",
        "peeling",
        "skinbooster",
        "harmonizacao_facial",
        "limpeza_pele",
        "microagulhamento",
      ],
      forma_pagamento_enum: ["pix", "cartao", "dinheiro", "transferencia"],
      origem_agendamento_enum: ["recepcao", "online", "whatsapp"],
      perfil_usuario_enum: [
        "admin",
        "recepcao",
        "profissional",
        "financeiro",
        "gestor",
      ],
      sexo_enum: ["feminino", "masculino", "outro", "nao_informar"],
      status_agendamento_enum: [
        "solicitado",
        "confirmado",
        "compareceu",
        "faltou",
        "cancelado",
      ],
      status_pagamento_enum: ["pendente", "pago", "estornado"],
      tipo_template_enum: ["whatsapp", "email", "termo"],
    },
  },
} as const
