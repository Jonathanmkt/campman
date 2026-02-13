#!/usr/bin/env node

/**
 * Script para geração de schema legível do Supabase
 * Projeto: Idealis Core
 * 
 * Gera um arquivo schema.md com a estrutura completa do banco de dados
 * em formato Markdown amigável para humanos e agentes de IA.
 * 
 * Uso: npm run generate-schema
 * 
 * Requer: SUPABASE_DB_URL no .env (connection string do Postgres)
 * Alternativa: usa NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Carregar variáveis de ambiente do arquivo .env
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) { log(`❌ ERRO: ${message}`, 'red'); }
function logSuccess(message) { log(`✅ ${message}`, 'green'); }
function logInfo(message) { log(`ℹ️  ${message}`, 'blue'); }

/**
 * Faz uma requisição HTTPS ao Supabase REST API
 */
function supabaseRequest(supabaseUrl, serviceKey, endpoint) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${supabaseUrl}/rest/v1/rpc/${endpoint}`);
    const options = {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Resposta inválida: ${data.substring(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

/**
 * Consulta o schema via SQL usando a Management API do Supabase
 */
function querySupabaseSQL(projectId, accessToken, sql) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://api.supabase.com/v1/projects/${projectId}/database/query`);
    const postData = JSON.stringify({ query: sql });

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Resposta inválida: ${data.substring(0, 500)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Obtém informações completas do schema public
 */
async function getSchemaInfo(projectId, accessToken) {
  logInfo('Consultando schema do banco de dados...');

  // Query para obter tabelas, colunas, tipos, constraints e comentários
  const tablesQuery = `
    SELECT 
      t.table_name,
      obj_description((quote_ident(t.table_schema) || '.' || quote_ident(t.table_name))::regclass, 'pg_class') as table_comment,
      CASE WHEN c_rls.relrowsecurity THEN true ELSE false END as rls_enabled
    FROM information_schema.tables t
    JOIN pg_class c_rls ON c_rls.relname = t.table_name AND c_rls.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = t.table_schema)
    WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
    ORDER BY t.table_name;
  `;

  const columnsQuery = `
    SELECT 
      c.table_name,
      c.column_name,
      c.data_type,
      c.udt_name,
      c.is_nullable,
      c.column_default,
      col_description((quote_ident(c.table_schema) || '.' || quote_ident(c.table_name))::regclass, c.ordinal_position) as column_comment,
      CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key,
      CASE WHEN uq.column_name IS NOT NULL THEN true ELSE false END as is_unique
    FROM information_schema.columns c
    LEFT JOIN (
      SELECT ku.table_name, ku.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
      WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public'
    ) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
    LEFT JOIN (
      SELECT ku.table_name, ku.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
      WHERE tc.constraint_type = 'UNIQUE' AND tc.table_schema = 'public'
    ) uq ON c.table_name = uq.table_name AND c.column_name = uq.column_name
    WHERE c.table_schema = 'public'
    ORDER BY c.table_name, c.ordinal_position;
  `;

  const fksQuery = `
    SELECT
      tc.table_name as source_table,
      kcu.column_name as source_column,
      ccu.table_name as target_table,
      ccu.column_name as target_column
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.column_name;
  `;

  const checksQuery = `
    SELECT
      tc.table_name,
      cc.check_clause
    FROM information_schema.table_constraints tc
    JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
    WHERE tc.constraint_type = 'CHECK' AND tc.table_schema = 'public'
      AND cc.check_clause NOT LIKE '%IS NOT NULL%'
    ORDER BY tc.table_name;
  `;

  const rowCountQuery = `
    SELECT 
      relname as table_name,
      n_live_tup as row_count
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY relname;
  `;

  // Executar todas as queries
  const [tables, columns, fks, checks, rowCounts] = await Promise.all([
    querySupabaseSQL(projectId, accessToken, tablesQuery),
    querySupabaseSQL(projectId, accessToken, columnsQuery),
    querySupabaseSQL(projectId, accessToken, fksQuery),
    querySupabaseSQL(projectId, accessToken, checksQuery),
    querySupabaseSQL(projectId, accessToken, rowCountQuery)
  ]);

  return { tables, columns, fks, checks, rowCounts };
}

/**
 * Formata tipo de dado para exibição amigável
 */
function formatType(dataType, udtName, columnDefault) {
  const typeMap = {
    'uuid': 'uuid',
    'text': 'text',
    'integer': 'integer',
    'bigint': 'bigint',
    'boolean': 'boolean',
    'numeric': 'numeric',
    'date': 'date',
    'timestamp with time zone': 'timestamptz',
    'timestamp without time zone': 'timestamp',
    'jsonb': 'jsonb',
    'json': 'json',
    'ARRAY': `${udtName.replace(/^_/, '')}[]`,
    'USER-DEFINED': udtName
  };
  return typeMap[dataType] || dataType;
}

/**
 * Gera o Markdown do schema
 */
function generateSchemaMarkdown(schemaInfo) {
  const { tables, columns, fks, checks, rowCounts } = schemaInfo;

  // Indexar dados por tabela
  const columnsByTable = {};
  const fksByTable = {};
  const checksByTable = {};
  const rowCountByTable = {};

  if (Array.isArray(columns)) {
    columns.forEach(col => {
      if (!columnsByTable[col.table_name]) columnsByTable[col.table_name] = [];
      columnsByTable[col.table_name].push(col);
    });
  }

  if (Array.isArray(fks)) {
    fks.forEach(fk => {
      if (!fksByTable[fk.source_table]) fksByTable[fk.source_table] = [];
      fksByTable[fk.source_table].push(fk);
    });
  }

  if (Array.isArray(checks)) {
    checks.forEach(chk => {
      if (!checksByTable[chk.table_name]) checksByTable[chk.table_name] = [];
      checksByTable[chk.table_name].push(chk);
    });
  }

  if (Array.isArray(rowCounts)) {
    rowCounts.forEach(rc => {
      rowCountByTable[rc.table_name] = rc.row_count;
    });
  }

  let md = '';

  // Header
  md += `# Schema do Banco de Dados — Idealis Core\n\n`;
  md += `> **Gerado automaticamente** em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}\n`;
  md += `> **Projeto Supabase:** xkqtrwbnionpbjziilgy\n`;
  md += `> **Schema:** public\n\n`;

  // Resumo
  const tableList = Array.isArray(tables) ? tables : [];
  md += `## Resumo\n\n`;
  md += `| Total de Tabelas | Com RLS | Sem RLS |\n`;
  md += `|---|---|---|\n`;
  const withRls = tableList.filter(t => t.rls_enabled).length;
  md += `| ${tableList.length} | ${withRls} | ${tableList.length - withRls} |\n\n`;

  // Índice
  md += `## Índice de Tabelas\n\n`;
  tableList.forEach(t => {
    const rows = rowCountByTable[t.table_name] || 0;
    const rls = t.rls_enabled ? '🔒' : '⚠️';
    md += `- ${rls} **${t.table_name}** (${rows} registros)${t.table_comment ? ` — ${t.table_comment}` : ''}\n`;
  });
  md += `\n> 🔒 = RLS ativado | ⚠️ = RLS desativado\n\n`;
  md += `---\n\n`;

  // Detalhe de cada tabela
  tableList.forEach(t => {
    const tableName = t.table_name;
    const cols = columnsByTable[tableName] || [];
    const tableFks = fksByTable[tableName] || [];
    const tableChecks = checksByTable[tableName] || [];
    const rows = rowCountByTable[tableName] || 0;

    md += `## ${tableName}\n\n`;
    if (t.table_comment) md += `> ${t.table_comment}\n\n`;
    md += `- **RLS:** ${t.rls_enabled ? '✅ Ativado' : '⚠️ Desativado'}\n`;
    md += `- **Registros:** ${rows}\n\n`;

    // Colunas
    md += `| Coluna | Tipo | Null | Default | PK | Unique | Descrição |\n`;
    md += `|---|---|---|---|---|---|---|\n`;
    cols.forEach(col => {
      const tipo = formatType(col.data_type, col.udt_name, col.column_default);
      const nullable = col.is_nullable === 'YES' ? '✓' : '';
      const def = col.column_default ? `\`${col.column_default.substring(0, 40)}\`` : '';
      const pk = col.is_primary_key ? '🔑' : '';
      const uq = col.is_unique ? '✓' : '';
      const comment = col.column_comment || '';
      md += `| ${col.column_name} | ${tipo} | ${nullable} | ${def} | ${pk} | ${uq} | ${comment} |\n`;
    });
    md += `\n`;

    // Foreign Keys
    if (tableFks.length > 0) {
      md += `**Foreign Keys:**\n`;
      tableFks.forEach(fk => {
        md += `- \`${fk.source_column}\` → \`${fk.target_table}.${fk.target_column}\`\n`;
      });
      md += `\n`;
    }

    // Check Constraints
    if (tableChecks.length > 0) {
      md += `**Check Constraints:**\n`;
      tableChecks.forEach(chk => {
        md += `- \`${chk.check_clause}\`\n`;
      });
      md += `\n`;
    }

    md += `---\n\n`;
  });

  return md;
}

async function main() {
  log('\n📊 Gerando schema legível do banco de dados', 'bright');
  log('📋 Projeto: Idealis Core\n', 'cyan');

  const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

  if (!projectId) {
    logError('NEXT_PUBLIC_SUPABASE_PROJECT_ID não encontrado no .env');
    process.exit(1);
  }

  if (!accessToken) {
    logError('SUPABASE_ACCESS_TOKEN não encontrado no .env');
    logInfo('Este script usa a Management API do Supabase para consultar o schema.');
    logInfo('Adicione SUPABASE_ACCESS_TOKEN ao seu .env');
    process.exit(1);
  }

  try {
    // Obter informações do schema
    const schemaInfo = await getSchemaInfo(projectId, accessToken);

    // Gerar Markdown
    const markdown = generateSchemaMarkdown(schemaInfo);

    // Salvar arquivo
    const outputPath = path.join(__dirname, 'schema.md');
    fs.writeFileSync(outputPath, markdown, 'utf8');

    // Contar tabelas
    const tableCount = Array.isArray(schemaInfo.tables) ? schemaInfo.tables.length : 0;
    const columnCount = Array.isArray(schemaInfo.columns) ? schemaInfo.columns.length : 0;

    logSuccess(`Schema gerado com sucesso!`);
    logInfo(`📋 ${tableCount} tabelas, ${columnCount} colunas documentadas`);
    logInfo(`📄 Arquivo: src/types/schema.md`);

  } catch (error) {
    logError(`Erro ao gerar schema: ${error.message}`);
    logInfo('Verifique se SUPABASE_ACCESS_TOKEN e NEXT_PUBLIC_SUPABASE_PROJECT_ID estão corretos no .env');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, getSchemaInfo, generateSchemaMarkdown };
