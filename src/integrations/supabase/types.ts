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
      agendamentos: {
        Row: {
          cliente_id: string
          created_at: string
          data_hora_fim: string
          data_hora_inicio: string
          id: string
          lembrete_enviado_em: string | null
          observacoes: string | null
          origem: Database["public"]["Enums"]["origem_agendamento_enum"]
          politica_cancelamento_aceita: boolean
          profissional_id: string
          sala_id: string | null
          servico_id: string
          status: Database["public"]["Enums"]["status_agendamento_enum"]
          updated_at: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_hora_fim: string
          data_hora_inicio: string
          id?: string
          lembrete_enviado_em?: string | null
          observacoes?: string | null
          origem?: Database["public"]["Enums"]["origem_agendamento_enum"]
          politica_cancelamento_aceita?: boolean
          profissional_id: string
          sala_id?: string | null
          servico_id: string
          status?: Database["public"]["Enums"]["status_agendamento_enum"]
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_hora_fim?: string
          data_hora_inicio?: string
          id?: string
          lembrete_enviado_em?: string | null
          observacoes?: string | null
          origem?: Database["public"]["Enums"]["origem_agendamento_enum"]
          politica_cancelamento_aceita?: boolean
          profissional_id?: string
          sala_id?: string | null
          servico_id?: string
          status?: Database["public"]["Enums"]["status_agendamento_enum"]
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
        ]
      }
      clientes: {
        Row: {
          alergias: string | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          consentimento_lgpd: boolean
          cpf_cnpj: string | null
          created_at: string
          data_nascimento: string | null
          email: string | null
          id: string
          instagram: string | null
          logradouro: string | null
          medicamentos_uso: string | null
          nome_completo: string
          numero: string | null
          observacoes: string | null
          sexo: Database["public"]["Enums"]["sexo_enum"] | null
          telefone: string
          termo_consentimento_assinado_em: string | null
          uf: string | null
          updated_at: string
        }
        Insert: {
          alergias?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          consentimento_lgpd?: boolean
          cpf_cnpj?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          logradouro?: string | null
          medicamentos_uso?: string | null
          nome_completo: string
          numero?: string | null
          observacoes?: string | null
          sexo?: Database["public"]["Enums"]["sexo_enum"] | null
          telefone: string
          termo_consentimento_assinado_em?: string | null
          uf?: string | null
          updated_at?: string
        }
        Update: {
          alergias?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          consentimento_lgpd?: boolean
          cpf_cnpj?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          logradouro?: string | null
          medicamentos_uso?: string | null
          nome_completo?: string
          numero?: string | null
          observacoes?: string | null
          sexo?: Database["public"]["Enums"]["sexo_enum"] | null
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
          {
            foreignKeyName: "logs_auditoria_por_usuario_id_fkey"
            columns: ["por_usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios_safe"
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
      usuarios_safe: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          email: string | null
          id: string | null
          nome: string | null
          perfil: Database["public"]["Enums"]["perfil_usuario_enum"] | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          nome?: string | null
          perfil?: Database["public"]["Enums"]["perfil_usuario_enum"] | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          nome?: string | null
          perfil?: Database["public"]["Enums"]["perfil_usuario_enum"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_access_client: {
        Args: { client_uuid: string; user_uuid: string }
        Returns: boolean
      }
      get_user_data_secure: {
        Args: { target_user_id: string }
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
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          required_role: Database["public"]["Enums"]["app_role"]
          user_uuid: string
        }
        Returns: boolean
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
