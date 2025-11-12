# API de Associados

Esta API fornece endpoints para gerenciar associados no sistema.

## Endpoints

### GET /api/supabase/associados
Lista todos os associados com suporte a paginação e filtros.

**Parâmetros de Query:**
- `page`: Número da página (padrão: 1)
- `pageSize`: Tamanho da página (padrão: 50)
- `search`: Termo de busca para filtrar associados
- `situacao`: Filtro por situação (ativo, inativo, pendente, inadimplente, todos)
- `orderBy`: Campo para ordenação (padrão: nome_completo)
- `orderDirection`: Direção da ordenação (asc, desc)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "pageSize": 50,
      "totalItems": 100,
      "totalPages": 2,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### GET /api/supabase/associados/[id]
Obtém os detalhes de um associado específico.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nome_completo": "Nome do Associado",
    ...
  }
}
```

### POST /api/supabase/associados/create
Cria um novo associado.

**Corpo da Requisição:**
```json
{
  "nome_completo": "Nome do Associado",
  "cpf": "12345678900",
  ...
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Associado cadastrado com sucesso",
  "data": {
    "id": "uuid"
  }
}
```

### PUT /api/supabase/associados/[id]
Atualiza os dados de um associado existente.

**Corpo da Requisição:**
```json
{
  "nome_completo": "Nome Atualizado",
  ...
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Associado atualizado com sucesso",
  "data": {
    "id": "uuid"
  }
}
```

### DELETE /api/supabase/associados/[id]
Remove um associado do sistema.

**Resposta:**
```json
{
  "success": true,
  "message": "Associado excluído com sucesso",
  "data": null
}
```

### POST /api/supabase/associados/[id]/upload-foto
Faz upload de uma foto para um associado específico.

**Corpo da Requisição:**
Deve ser enviado como `multipart/form-data` com um campo `foto` contendo o arquivo de imagem.

**Resposta:**
```json
{
  "success": true,
  "message": "Foto atualizada com sucesso",
  "data": {
    "foto_url": "https://..."
  }
}
```

## Estrutura de Dados

### Associado
```typescript
{
  id: string;
  nome_completo: string;
  cpf: string;
  matricula: number | null;
  telefone: string | null;
  email: string | null;
  data_nascimento: string | null;
  sexo: string;
  estado_civil: string | null;
  situacao: string;
  drt: number | null;
  observacao: string | null;
  endereco_data: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  rg_data: {
    numero: string;
    orgao_emissor: string;
    data_emissao: string | null;
  };
  ctps_data: {
    numero: string | null;
    serie: string | null;
  };
  titulo_eleitor_data: {
    numero: string | null;
    zona: string | null;
    secao: string | null;
  };
  inadimplente: boolean;
  encarregado_tambem: boolean;
  nome_pai: string | null;
  nome_mae: string | null;
  nacionalidade: string | null;
  naturalidade: string | null;
  tipo_sanguineo: string | null;
  certificado_reservista: string | null;
  data_expedicao: string | null;
  processo: string | null;
  livro: string | null;
  folha: string | null;
  inss: string | null;
  data_drt: string | null;
  data_registro: string | null;
  data_admissao: string | null;
  foto: string | null;
  created_at: string;
  updated_at: string;
}
```
