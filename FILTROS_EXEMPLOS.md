# 🔍 **FILTROS DE VOTAÇÃO - GUIA DE USO**

## ✨ **Funcionalidades Implementadas**

### 📊 **Filtro por Faixa de Votos**
- **Votos Mínimo**: Define o número mínimo de votos
- **Votos Máximo**: Define o número máximo de votos
- **Aplicar Filtro**: Aplica os filtros definidos
- **Limpar Filtros**: Remove todos os filtros

### 📄 **PDF Personalizado**
- PDF gerado com base nos candidatos filtrados
- Nome do arquivo indica se é filtrado ou completo
- Informações do filtro aplicado no cabeçalho do PDF

---

## 🎯 **Exemplos de Uso**

### **1. Candidatos Mais Votados (Top Performers)**
```
Votos Mínimo: 1500
Votos Máximo: (deixar vazio)
```
**Resultado**: Candidatos com 1.500+ votos
**PDF**: `candidatos_araruama_2024_filtrado_X_2024-11-24.pdf`

### **2. Candidatos com Votação Média**
```
Votos Mínimo: 500
Votos Máximo: 1500
```
**Resultado**: Candidatos entre 500 e 1.500 votos
**Útil para**: Análise de candidatos com performance intermediária

### **3. Candidatos com Baixa Votação**
```
Votos Mínimo: (deixar vazio)
Votos Máximo: 500
```
**Resultado**: Candidatos com até 500 votos
**Útil para**: Identificar candidatos com menor expressão eleitoral

### **4. Faixa Específica (Exemplo: Competitivos)**
```
Votos Mínimo: 1000
Votos Máximo: 2000
```
**Resultado**: Candidatos na faixa competitiva
**Útil para**: Análise de candidatos em disputa acirrada

---

## 📋 **Como Usar**

1. **Acesse**: `http://localhost:3001/candidatos-araruama`
2. **Aguarde**: Os dados carregarem automaticamente
3. **Configure**: Os filtros na seção "Filtrar por Votação"
4. **Aplique**: Clique em "Aplicar Filtro"
5. **Visualize**: Os candidatos filtrados na lista
6. **Exporte**: Clique em "Baixar PDF" para gerar relatório

---

## 🎨 **Interface**

### **Campos de Filtro**
- ✅ **Inputs numéricos** para votos mínimo/máximo
- ✅ **Placeholders** com exemplos (Ex: 100, Ex: 2000)
- ✅ **Validação** para evitar mínimo > máximo
- ✅ **Feedback visual** quando filtro está ativo

### **Indicadores Visuais**
- 🔵 **Card azul** mostra status do filtro ativo
- 📊 **Contador dinâmico** no botão PDF
- 📋 **Mensagem final** indica quantidade filtrada
- 🧹 **Botão limpar** aparece apenas quando necessário

---

## 📊 **Dados de Araruama 2024**

**Total**: 274 candidatos
**Eleitos**: 17 candidatos
**Faixa de votos**: 0 a 2.290 votos

### **Sugestões de Filtros Úteis**:

| Filtro | Mínimo | Máximo | Descrição |
|--------|--------|--------|-----------|
| **Eleitos** | 1400 | - | Candidatos provavelmente eleitos |
| **Competitivos** | 800 | 1400 | Candidatos em disputa |
| **Médios** | 200 | 800 | Votação intermediária |
| **Baixos** | - | 200 | Votação baixa |
| **Top 10** | 1800 | - | Mais votados |

---

## 🚀 **Recursos Avançados**

### **PDF Inteligente**
- ✅ Nome do arquivo indica filtro aplicado
- ✅ Cabeçalho mostra faixa de votos filtrada
- ✅ Contagem precisa de candidatos
- ✅ Data e hora de geração

### **Responsividade**
- ✅ Layout adaptável para mobile/desktop
- ✅ Grid responsivo dos candidatos
- ✅ Filtros organizados em colunas

### **Performance**
- ✅ Filtragem instantânea no frontend
- ✅ Dados carregados uma única vez
- ✅ Interface reativa e fluida

---

## 🎉 **Pronto para Usar!**

A funcionalidade está **100% implementada** e pronta para uso.
Acesse a página e experimente os diferentes filtros para gerar
relatórios personalizados dos candidatos de Araruama 2024!
