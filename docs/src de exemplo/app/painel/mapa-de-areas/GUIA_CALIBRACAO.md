# 🎯 Guia de Calibração do Sistema de Mapa

## 📊 Indicadores Temporários Implementados

Foram adicionados dois indicadores temporários na interface do mapa para facilitar a calibração das configurações:

### **1. ZoomIndicator** (Canto Inferior Esquerdo)
Mostra informações sobre o nível de zoom atual:
- **Nível de Zoom**: Valor atual (ex: 15.2)
- **Tipo de Vista**: REGIÃO / BAIRRO / RUA
- **Distância Clustering**: Distância em metros para agrupamento
- **Máx. Áreas**: Limite de áreas carregadas para este zoom
- **Marcadores**: VISÍVEIS / OCULTOS

### **2. ClusteringDebugInfo** (Canto Superior Esquerdo)
Mostra estatísticas do sistema de clustering em tempo real:
- **Status**: CARREGANDO / PRONTO
- **Áreas Carregadas**: Total de áreas obtidas da API
- **Marcadores Individuais**: Áreas mostradas como marcadores únicos
- **Clusters Criados**: Número de grupos formados
- **Áreas em Clusters**: Total de áreas agrupadas
- **Total Marcadores**: Marcadores finais no mapa
- **Compressão**: Percentual de redução de marcadores

---

## 🔧 Como Calibrar o Sistema

### **Passo 1: Teste Diferentes Níveis de Zoom**
1. Abra a página do mapa de áreas
2. Use o scroll do mouse ou controles de zoom
3. Observe os indicadores conforme navega
4. Anote os valores que considera ideais

### **Passo 2: Identifique Zoom Mínimo para Marcadores**
- **Objetivo**: Determinar em qual zoom começar a mostrar marcadores
- **Atual**: Zoom 12 (configurado em `MAP_CONFIG.ZOOM.MIN_MARKERS`)
- **Teste**: Navegue de zoom 8 até 15 e veja quando faz sentido mostrar áreas

### **Passo 3: Calibre Distâncias de Clustering**
- **Objetivo**: Ajustar quando áreas devem ser agrupadas
- **Atual**: 
  - Zoom ≤12: 1000m
  - Zoom 13-16: 500m  
  - Zoom ≥17: 100m
- **Teste**: Veja se os agrupamentos fazem sentido geograficamente

### **Passo 4: Ajuste Limites de Áreas**
- **Objetivo**: Balancear performance vs completude
- **Atual**:
  - Zoom ≤12: 50 áreas
  - Zoom 13-16: 200 áreas
  - Zoom ≥17: 500 áreas
- **Teste**: Verifique se aparecem áreas suficientes em cada zoom

---

## 📋 Valores Recomendados para Teste

### **Cenário Conservador (Performance Máxima)**
```typescript
ZOOM: {
  MIN_MARKERS: 14,  // Só mostrar em zoom mais alto
  LEVELS: {
    REGION: { maxAreas: 30 },
    NEIGHBORHOOD: { maxAreas: 100 },
    STREET: { maxAreas: 300 }
  }
},
CLUSTERING: {
  DISTANCES: {
    LOW_ZOOM: 1500,   // Mais agrupamento
    MID_ZOOM: 750,
    HIGH_ZOOM: 150
  }
}
```

### **Cenário Balanceado (Recomendado)**
```typescript
ZOOM: {
  MIN_MARKERS: 12,  // Configuração atual
  LEVELS: {
    REGION: { maxAreas: 50 },
    NEIGHBORHOOD: { maxAreas: 200 },
    STREET: { maxAreas: 500 }
  }
},
CLUSTERING: {
  DISTANCES: {
    LOW_ZOOM: 1000,   // Configuração atual
    MID_ZOOM: 500,
    HIGH_ZOOM: 100
  }
}
```

### **Cenário Completo (Máxima Informação)**
```typescript
ZOOM: {
  MIN_MARKERS: 10,  // Mostrar mais cedo
  LEVELS: {
    REGION: { maxAreas: 100 },
    NEIGHBORHOOD: { maxAreas: 400 },
    STREET: { maxAreas: 800 }
  }
},
CLUSTERING: {
  DISTANCES: {
    LOW_ZOOM: 800,    // Menos agrupamento
    MID_ZOOM: 300,
    HIGH_ZOOM: 50
  }
}
```

---

## 🎯 Métricas para Avaliar

### **Performance**
- ⚡ **Tempo de Carregamento**: < 1 segundo é ideal
- 🔄 **Fluidez**: Navegação sem travamentos
- 💾 **Uso de Memória**: Monitorar no DevTools

### **Usabilidade**
- 👀 **Visibilidade**: Áreas importantes sempre visíveis
- 🎯 **Precisão**: Clustering faz sentido geograficamente
- 📱 **Responsividade**: Funciona bem em mobile

### **Completude**
- 📊 **Cobertura**: Todas as áreas relevantes aparecem
- 🔍 **Detalhamento**: Zoom alto mostra áreas individuais
- ⚖️ **Balanceamento**: Nem muito vazio nem muito cheio

---

## 🔧 Como Aplicar Mudanças

### **Arquivo de Configuração**: `config/mapConfig.ts`

1. **Ajustar Zoom Mínimo**:
```typescript
ZOOM: {
  MIN_MARKERS: 13, // Seu valor ideal
}
```

2. **Ajustar Distâncias de Clustering**:
```typescript
CLUSTERING: {
  DISTANCES: {
    LOW_ZOOM: 1200,  // Seus valores ideais
    MID_ZOOM: 600,
    HIGH_ZOOM: 120
  }
}
```

3. **Ajustar Limites de Áreas**:
```typescript
ZOOM: {
  LEVELS: {
    REGION: { maxAreas: 75 },      // Seus valores ideais
    NEIGHBORHOOD: { maxAreas: 250 },
    STREET: { maxAreas: 600 }
  }
}
```

---

## 🗑️ Remover Indicadores (Produção)

Quando estiver satisfeito com as configurações:

1. **No GoogleMap.tsx**, remover ou comentar:
```typescript
{/* Indicador de Zoom Temporário */}
{map && (
  <ZoomIndicator 
    zoom={currentZoom}
    isVisible={false} // Ou remover completamente
  />
)}

{/* Debug Info do Sistema de Clustering */}
{map && (
  <ClusteringDebugInfo
    // ... props
    isVisible={false} // Ou remover completamente
  />
)}
```

2. **Opcional**: Remover arquivos de debug:
- `components/ZoomIndicator.tsx`
- `components/ClusteringDebugInfo.tsx`

---

## 📞 Próximos Passos

1. **Teste o sistema** com os indicadores
2. **Anote os valores ideais** para sua região/uso
3. **Informe os valores** para aplicar nas configurações
4. **Remova os indicadores** para produção

**Status**: ✅ Indicadores implementados e prontos para calibração!
