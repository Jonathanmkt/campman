import { NextResponse } from 'next/server';

interface CandidatoCESPESP {
  ANO_ELEICAO: number;
  NUM_TURNO: number;
  NOME_URNA_CANDIDATO: string;
  NUMERO_CANDIDATO: string;
  SIGLA_PARTIDO: string;
  DESC_SIT_TOT_TURNO: string;
  QT_VOTOS_NOMINAIS: number;
}

export async function GET() {
  const allCandidates: CandidatoCESPESP[] = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;
  let queryId: string | null = null;

  try {
    console.log('🔍 Iniciando busca REAL de candidatos de Araruama/RJ na API CEPESP...');
    
    // 1️⃣ QUERY INICIAL - Buscar ID da consulta para Araruama/RJ
    const queryUrl = new URL("https://cepesp.io/api/consulta/athena/query");
    queryUrl.searchParams.append("table", "candidatos");
    queryUrl.searchParams.append("anos", "2024");
    queryUrl.searchParams.append("cargo", "13"); // 13 = Vereador
    queryUrl.searchParams.append("uf_filter", "RJ");
    queryUrl.searchParams.append("mun_filter", "3300209"); // 👈 ARARUAMA (código TSE/IBGE)
    queryUrl.searchParams.append("c[]", "ANO_ELEICAO");
    queryUrl.searchParams.append("c[]", "NUM_TURNO");
    queryUrl.searchParams.append("c[]", "NOME_URNA_CANDIDATO");
    queryUrl.searchParams.append("c[]", "NUMERO_CANDIDATO");
    queryUrl.searchParams.append("c[]", "SIGLA_PARTIDO");
    queryUrl.searchParams.append("c[]", "DESC_SIT_TOT_TURNO");
    queryUrl.searchParams.append("c[]", "QT_VOTOS_NOMINAIS");

    console.log("🔍 Query URL:", queryUrl);
    
    const queryRes = await fetch(queryUrl);
    
    if (!queryRes.ok) {
      throw new Error(`Query falhou: ${queryRes.status} ${queryRes.statusText}`);
    }
    
    const queryData = await queryRes.json();
    queryId = queryData.id;

    if (!queryId) {
      throw new Error("CEPESP não retornou ID da consulta");
    }

    console.log("✅ Query ID recebido:", queryId);

    // 2️⃣ LOOP PARA BUSCAR TODAS AS PÁGINAS
    while (hasMore) {
      const resultUrl = 
        `https://cepesp.io/api/consulta/athena/result?` +
        `id=${encodeURIComponent(queryId)}&` +
        `limit=${limit}&` +
        `offset=${offset}&` +
        `ignore_version=true`;

      console.log(`📄 Buscando página offset=${offset}, limit=${limit}...`);
      
      const resultRes = await fetch(resultUrl);
      
      if (!resultRes.ok) {
        throw new Error(`Result falhou: ${resultRes.status} ${resultRes.statusText}`);
      }
      
      const pageData = await resultRes.json();

      if (Array.isArray(pageData) && pageData.length > 0) {
        allCandidates.push(...pageData);
        offset += limit;

        console.log(`✅ Adicionados ${pageData.length} candidatos. Total: ${allCandidates.length}`);

        // Se retornou menos do que pedimos, chegamos ao fim
        if (pageData.length < limit) {
          hasMore = false;
          console.log("✅ Fim da paginação atingido!");
        }
      } else {
        hasMore = false;
        console.log("✅ Sem mais dados");
      }

      // Proteção: máximo 100 requisições
      if (offset > 10000) {
        console.warn("⚠️ Limite de requisições atingido");
        hasMore = false;
      }

      // Pequeno delay entre requisições para não sobrecarregar a API
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log(`🎉 Total final: ${allCandidates.length} candidatos de Araruama/RJ`);

    // Ordenar por votos (decrescente)
    allCandidates.sort((a, b) => (b.QT_VOTOS_NOMINAIS || 0) - (a.QT_VOTOS_NOMINAIS || 0));

    return NextResponse.json({
      success: true,
      total: allCandidates.length,
      municipio: "Araruama",
      estado: "RJ",
      cargo: "Vereador",
      ano: 2024,
      data: allCandidates,
      source: "API CEPESP - Dados Reais TSE 2024"
    });

  } catch (error) {
    console.error("❌ Erro na API CEPESP:", error);
    
    // Usar dados oficiais de Araruama 2024
    console.log("🔄 Carregando dados oficiais de Araruama...");
    
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Carregar dados oficiais do arquivo JSON
      const dadosOficiaisPath = path.join(process.cwd(), 'araruama_eleicao2024_vereadores.json');
      const dadosOficiaisRaw = fs.readFileSync(dadosOficiaisPath, 'utf8');
      const dadosOficiais = JSON.parse(dadosOficiaisRaw);
      
      // Converter para formato da API
      const candidatosFormatados = dadosOficiais.map((candidato: any) => {
        // Extrair número e partido
        const partidoNumero = candidato["Partido e numero"] || candidato["Party and Number"] || "";
        const [partido, numero] = partidoNumero.split(" – ");
        
        // Extrair votos
        const votosText = candidato["Votes"] || candidato["Vote Count"] || "0";
        const votos = parseInt(votosText.toString().replace(/[^\d]/g, '')) || 0;
        
        // Determinar situação
        const status = candidato["Election Status"] || candidato["Candidate Status"] || "";
        const eleito = status.toLowerCase().includes("eleito") && !status.toLowerCase().includes("não");
        
        return {
          ANO_ELEICAO: 2024,
          NUM_TURNO: 1,
          NOME_URNA_CANDIDATO: candidato["Candidate Name"] || "",
          NUMERO_CANDIDATO: numero || "",
          SIGLA_PARTIDO: partido || "",
          DESC_SIT_TOT_TURNO: eleito ? "ELEITO" : "NÃO ELEITO",
          QT_VOTOS_NOMINAIS: votos,
          POSICAO: parseInt(candidato["Position"] || "0"),
          STATUS_DETALHADO: status
        };
      });

      // Ordenar por votos (decrescente)
      candidatosFormatados.sort((a: any, b: any) => b.QT_VOTOS_NOMINAIS - a.QT_VOTOS_NOMINAIS);

      const eleitos = candidatosFormatados.filter((c: any) => c.DESC_SIT_TOT_TURNO === "ELEITO");
      
      console.log(`✅ Carregados ${candidatosFormatados.length} candidatos oficiais (${eleitos.length} eleitos)`);

      return NextResponse.json({
        success: true,
        total: candidatosFormatados.length,
        municipio: "Araruama",
        estado: "RJ",
        cargo: "Vereador",
        ano: 2024,
        eleitos: eleitos.length,
        data: candidatosFormatados,
        source: "TSE - Dados Oficiais Araruama 2024",
        note: "Dados oficiais completos da eleição para vereador de Araruama/RJ 2024"
      });

    } catch (fallbackError) {
      console.error("❌ Erro ao carregar dados oficiais:", fallbackError);
      
      return NextResponse.json(
        { 
          success: false, 
          error: "Erro ao carregar dados oficiais de Araruama",
          details: 'Não foi possível carregar os dados oficiais da eleição.',
          municipio: "Araruama",
          estado: "RJ",
          cargo: "Vereador",
          ano: 2024
        },
        { status: 500 }
      );
    }
  }
}
