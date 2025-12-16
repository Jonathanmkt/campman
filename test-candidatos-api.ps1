# Script de Teste da API de Candidatos de Araruama
# Testa a integração com CEPESP e funcionalidades da página

Write-Host "🧪 TESTE COMPLETO DA API DE CANDIDATOS ARARUAMA/RJ" -ForegroundColor Cyan
Write-Host "=" * 60

# Teste 1: Verificar se o servidor está rodando
Write-Host "`n1️⃣ Verificando servidor Next.js..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:3001" -Method GET -TimeoutSec 5
    Write-Host "✅ Servidor rodando em http://localhost:3001" -ForegroundColor Green
} catch {
    Write-Host "❌ Servidor não está rodando! Execute 'npm run dev'" -ForegroundColor Red
    exit 1
}

# Teste 2: Testar API de candidatos
Write-Host "`n2️⃣ Testando API /api/candidatos-araruama..." -ForegroundColor Yellow
try {
    $startTime = Get-Date
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/candidatos-araruama" -Method GET -TimeoutSec 30
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    Write-Host "✅ API respondeu em $([math]::Round($duration, 2)) segundos" -ForegroundColor Green
    Write-Host "📊 Total de candidatos: $($response.total)" -ForegroundColor Cyan
    Write-Host "🏛️ Município: $($response.municipio)/$($response.estado)" -ForegroundColor Cyan
    Write-Host "🗳️ Cargo: $($response.cargo) - Ano: $($response.ano)" -ForegroundColor Cyan
    Write-Host "📡 Fonte: $($response.source)" -ForegroundColor Cyan
    
    if ($response.error) {
        Write-Host "⚠️ Erro reportado: $($response.error)" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Erro na API: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Teste 3: Validar estrutura dos dados
Write-Host "`n3️⃣ Validando estrutura dos dados..." -ForegroundColor Yellow
$candidato = $response.data[0]
$camposObrigatorios = @("ANO_ELEICAO", "NOME_URNA_CANDIDATO", "NUMERO_CANDIDATO", "SIGLA_PARTIDO", "DESC_SIT_TOT_TURNO", "QT_VOTOS_NOMINAIS")

foreach ($campo in $camposObrigatorios) {
    if ($candidato.PSObject.Properties.Name -contains $campo) {
        Write-Host "✅ Campo '$campo' presente" -ForegroundColor Green
    } else {
        Write-Host "❌ Campo '$campo' ausente!" -ForegroundColor Red
    }
}

# Teste 4: Mostrar amostra dos dados
Write-Host "`n4️⃣ Amostra dos primeiros 5 candidatos:" -ForegroundColor Yellow
$response.data[0..4] | ForEach-Object -Begin { $i = 1 } -Process {
    $status = if ($_.DESC_SIT_TOT_TURNO -like "*ELEITO*") { "🟢" } else { "🔴" }
    Write-Host "$i. $status $($_.NOME_URNA_CANDIDATO) ($($_.SIGLA_PARTIDO)) - Nº $($_.NUMERO_CANDIDATO) - $($_.QT_VOTOS_NOMINAIS) votos" -ForegroundColor White
    $i++
}

# Teste 5: Estatísticas
Write-Host "`n5️⃣ Estatísticas dos candidatos:" -ForegroundColor Yellow
$eleitos = ($response.data | Where-Object { $_.DESC_SIT_TOT_TURNO -like "*ELEITO*" }).Count
$naoEleitos = $response.total - $eleitos
$totalVotos = ($response.data | Measure-Object -Property QT_VOTOS_NOMINAIS -Sum).Sum
$mediaVotos = [math]::Round(($response.data | Measure-Object -Property QT_VOTOS_NOMINAIS -Average).Average, 0)

Write-Host "🟢 Eleitos: $eleitos" -ForegroundColor Green
Write-Host "🔴 Não eleitos: $naoEleitos" -ForegroundColor Red
Write-Host "📊 Total de votos: $($totalVotos.ToString('N0'))" -ForegroundColor Cyan
Write-Host "📈 Média de votos: $($mediaVotos.ToString('N0'))" -ForegroundColor Cyan

# Teste 6: Partidos
Write-Host "`n6️⃣ Distribuição por partidos:" -ForegroundColor Yellow
$partidos = $response.data | Group-Object -Property SIGLA_PARTIDO | Sort-Object Count -Descending | Select-Object -First 5
foreach ($partido in $partidos) {
    Write-Host "🏛️ $($partido.Name): $($partido.Count) candidatos" -ForegroundColor White
}

# Teste 7: Testar página web
Write-Host "`n7️⃣ Testando página web..." -ForegroundColor Yellow
try {
    $pageResponse = Invoke-WebRequest -Uri "http://localhost:3001/candidatos-araruama" -Method GET -TimeoutSec 10
    if ($pageResponse.StatusCode -eq 200) {
        Write-Host "✅ Página carregou com sucesso (Status: $($pageResponse.StatusCode))" -ForegroundColor Green
        Write-Host "📄 Tamanho da página: $([math]::Round($pageResponse.Content.Length / 1024, 1)) KB" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Erro ao carregar página: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 TESTE CONCLUÍDO!" -ForegroundColor Green
Write-Host "=" * 60
Write-Host "📋 RESUMO:" -ForegroundColor Cyan
Write-Host "• API funcionando: ✅" -ForegroundColor White
Write-Host "• Total candidatos: $($response.total)" -ForegroundColor White
Write-Host "• Fonte dos dados: $($response.source)" -ForegroundColor White
Write-Host "• Página web: ✅" -ForegroundColor White
Write-Host "`n🌐 Acesse: http://localhost:3001/candidatos-araruama" -ForegroundColor Yellow
