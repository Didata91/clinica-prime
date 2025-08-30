# Fluxo de Redefinição de Senha

## Configuração Supabase

### URLs de Configuração (Auth → URL Configuration)

**Site URL:**
- Produção: `https://clinica-prime.app`
- Desenvolvimento: `http://localhost:3000`

**Redirect URLs:**
- `https://clinica-prime.app/auth/callback`
- `https://clinica-prime.app/reset-password`
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/reset-password`

## Como Testar

### Desenvolvimento Local

1. **Iniciar o fluxo de reset:**
   - Acesse `/auth`
   - Clique em "Esqueceu sua senha?"
   - Digite um email válido cadastrado
   - Clique em "Enviar link"

2. **Verificar email:**
   - Acesse o email cadastrado
   - Clique no link recebido
   - Será redirecionado para `/reset-password`

3. **Redefinir senha:**
   - Digite uma nova senha (mínimo 8 caracteres)
   - Confirme a senha
   - Clique em "Redefinir senha"
   - Será redirecionado para `/auth`

4. **Testar nova senha:**
   - Faça login com a nova senha

### Produção

O mesmo fluxo funciona em produção, mas os links do email apontarão para o domínio configurado no Supabase.

## Casos de Erro

### Link Inválido/Expirado
- Se acessar `/reset-password` sem sessão válida
- Mostra mensagem explicativa
- Botão para voltar ao login

### Senhas não coincidem
- Validação no cliente
- Mensagem de erro clara

### Email não encontrado
- Sempre retorna mensagem neutra
- Evita enumeração de emails

## Segurança

- Apenas chaves públicas no frontend
- Links de reset com token temporal
- Validação de força de senha
- Prevenção de enumeração de emails
- Redirecionamento seguro via callback

## Variáveis de Ambiente

```env
VITE_SUPABASE_URL="https://cjtxesxfptsmqhcalkcr.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJ..."
VITE_SITE_URL="https://clinica-prime.app"
```