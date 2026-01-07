import { useState, useEffect } from 'react';

interface ContactData {
  nome?: string;
  telefone?: string;
}

export function useMobileContacts() {
  const [contactPickerAvailable, setContactPickerAvailable] = useState(false);
  const [isMobileBrowser, setIsMobileBrowser] = useState(false);
  const [isImportingContact, setIsImportingContact] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const nav = navigator as Navigator & {
      contacts?: {
        select?: (properties: string[], options?: { multiple?: boolean }) => Promise<Array<{ name?: string | string[]; tel?: string | string[] }>>;
      };
    };

    setContactPickerAvailable(Boolean(nav?.contacts?.select));
    setIsMobileBrowser(/android|iphone|ipad|ipod/i.test(navigator.userAgent));
  }, []);

  const importFromContacts = async (): Promise<ContactData | null> => {
    const nav = navigator as Navigator & {
      contacts?: {
        select?: (properties: string[], options?: { multiple?: boolean }) => Promise<Array<{ name?: string | string[]; tel?: string | string[] }>>;
      };
    };

    if (!nav?.contacts?.select) {
      return null;
    }

    try {
      setIsImportingContact(true);
      const [selected] = await nav.contacts.select(['name', 'tel'], { multiple: false });

      const rawName = Array.isArray(selected?.name) ? selected?.name[0] : selected?.name;
      const rawTel = Array.isArray(selected?.tel) ? selected?.tel[0] : selected?.tel;

      return {
        nome: rawName ?? '',
        telefone: rawTel ?? '',
      };
    } catch (error) {
      console.error('Erro ao abrir contatos do aparelho', error);
      alert('Não foi possível acessar os contatos. Insira os dados manualmente.');
      return null;
    } finally {
      setIsImportingContact(false);
    }
  };

  return {
    contactPickerAvailable,
    isMobileBrowser,
    isImportingContact,
    importFromContacts,
  };
}
