'use client';

import { useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { FilterPanel } from './components/FilterPanel';
import { AddButton } from './components/AddButton';
import { ContactChoiceDialog } from './modals/ContactChoiceDialog';
import { NovaLiderancaModal } from './modals/NovaLiderancaModal';
import { LiderancaList } from './components/LiderancaList';
import { useLiderancas } from './hooks/useLiderancas';
import { useFiltros } from './hooks/useFiltros';
import { useMobileContacts } from './hooks/useMobileContacts';

export default function LiderancasPage() {
  // Estados de controle de modais
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isChoiceDialogOpen, setIsChoiceDialogOpen] = useState(false);
  const [prefillData, setPrefillData] = useState<{ nome?: string; telefone?: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Hooks customizados
  const {
    liderancas,
    isLoading,
    cidadesDisponiveis,
    bairrosDisponiveis,
    fetchLiderancas,
    handleCompartilharConvite,
    handleAbrirLocalizacao,
  } = useLiderancas();

  const {
    showFilters,
    setShowFilters,
    filtrosTemp,
    alcanceRange,
    setAlcanceRange,
    percentualRange,
    setPercentualRange,
    filtrarLiderancas,
    toggleConviteStatus,
    toggleCidade,
    toggleBairro,
    toggleTipoFiltro,
    selecionarNivelFiltro,
    limparFiltros,
    aplicarFiltros,
    cancelarFiltros,
    contarFiltrosAtivos,
  } = useFiltros();

  const {
    contactPickerAvailable,
    isMobileBrowser,
    isImportingContact,
    importFromContacts,
  } = useMobileContacts();

  // Aplicar filtros
  const filteredLiderancas = filtrarLiderancas(liderancas, searchTerm);

  // Handlers de modais
  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setPrefillData(null);
    }
  };

  const handleLiderancaAdded = () => {
    setIsSheetOpen(false);
    setPrefillData(null);
    fetchLiderancas();
  };

  const handleAddClick = () => {
    if (contactPickerAvailable && isMobileBrowser) {
      setIsChoiceDialogOpen(true);
      return;
    }
    setPrefillData(null);
    setIsSheetOpen(true);
  };

  const handleImportFromContactsClick = async () => {
    const contactData = await importFromContacts();
    if (contactData) {
      setPrefillData(contactData);
    }
    setIsChoiceDialogOpen(false);
    setIsSheetOpen(true);
  };

  const handleManualFormClick = () => {
    setIsChoiceDialogOpen(false);
    setPrefillData(null);
    setIsSheetOpen(true);
  };

  const handleLimparFiltrosCompleto = () => {
    limparFiltros();
    aplicarFiltros();
  };

  return (
    <div className="flex flex-col h-full">
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onFilterClick={() => setShowFilters(!showFilters)}
        filtrosAtivos={contarFiltrosAtivos()}
      />

      <FilterPanel
        show={showFilters}
        filtrosTemp={filtrosTemp}
        cidadesDisponiveis={cidadesDisponiveis}
        bairrosDisponiveis={bairrosDisponiveis}
        alcanceRange={alcanceRange}
        percentualRange={percentualRange}
        onToggleConviteStatus={toggleConviteStatus}
        onToggleCidade={toggleCidade}
        onToggleBairro={toggleBairro}
        onToggleTipo={toggleTipoFiltro}
        onSelecionarNivel={selecionarNivelFiltro}
        onAlcanceChange={setAlcanceRange}
        onPercentualChange={setPercentualRange}
        onLimpar={limparFiltros}
        onAplicar={aplicarFiltros}
        onCancelar={cancelarFiltros}
      />

      <LiderancaList
        liderancas={filteredLiderancas}
        isLoading={isLoading}
        totalLiderancas={liderancas.length}
        hasFilters={contarFiltrosAtivos() > 0}
        hasSearch={!!searchTerm}
        filtrosAtivos={contarFiltrosAtivos()}
        onLimparFiltros={handleLimparFiltrosCompleto}
        onCompartilharConvite={handleCompartilharConvite}
        onAbrirLocalizacao={handleAbrirLocalizacao}
      />

      <ContactChoiceDialog
        open={isChoiceDialogOpen}
        onOpenChange={setIsChoiceDialogOpen}
        onImportFromContacts={handleImportFromContactsClick}
        onManualForm={handleManualFormClick}
        isImporting={isImportingContact}
      />

      <AddButton onClick={handleAddClick} />

      <NovaLiderancaModal
        open={isSheetOpen}
        onOpenChange={handleSheetOpenChange}
        prefillData={prefillData}
        onSuccess={handleLiderancaAdded}
        onCancel={() => setIsSheetOpen(false)}
      />
    </div>
  );
}
