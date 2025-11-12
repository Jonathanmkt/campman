'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import log from '@/lib/logger';
import { getUserPublicData } from '@/actions/getUserPublicData';
import { createClient } from '@/lib/supabase/client';

// Definição do tipo para os dados públicos que vêm do middleware (apenas dados seguros)
export type UserData = {
  nome_completo?: string;
  foto_url?: string | null;
  is_chatwoot_admin?: boolean; // Flag para UX (mostrar/ocultar botões)
}; // Apenas os três campos públicos necessários

// Definição do tipo para o contexto
export type UserContextType = {
  userData: UserData | null;
  isLoading: boolean; // Indica se os dados estão sendo carregados
  isReady: boolean;   // Indica se os dados estão prontos para uso
  signOut: () => Promise<void>;
  confirmDataReceived: () => Promise<void>; // Confirma que os dados foram recebidos
};

// Criação do contexto com valor inicial
const UserContext = createContext<UserContextType>({
  userData: null,
  isLoading: false,
  isReady: false,
  signOut: async () => {},
  confirmDataReceived: async () => {},
});

// Hook para usar o contexto
export const useUserInfo = () => useContext(UserContext);

// Hook alias para manter compatibilidade com código existente
export const useUser = () => useContext(UserContext);

// ID estático para o UserContext para evitar remontagens desnecessárias
const STATIC_USER_CONTEXT_ID = 'userContext-global';

// Provider do contexto - REATIVADO
export function UserProvider({ 
  children, 
  providersId = 'unknown'
}: { 
  children: React.ReactNode;
  providersId?: string;
}) {
  // Usando ID estático para evitar o loop infinito
  const userContextId = STATIC_USER_CONTEXT_ID;
  
  // Estados para controlar o fluxo de dados
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Começa carregando
  const [isReady, setIsReady] = useState<boolean>(false); // Começa não pronto
  
  log.info(`[UserContext:${userContextId}] Renderizando UserProvider (de Providers ${providersId})`);

  // Função para fazer logout
  const signOut = async () => {
    log.info(`[UserContext:${userContextId}] Função signOut chamada`);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        log.error(`[UserContext:${userContextId}] Erro ao fazer logout:`, error);
        throw error;
      }
      
      // Limpar dados do usuário após logout bem-sucedido
      setUserData(null);
      setIsReady(false);
      
      log.info(`[UserContext:${userContextId}] Logout realizado com sucesso`);
    } catch (error) {
      log.error(`[UserContext:${userContextId}] Erro durante o processo de logout:`, error);
      throw error;
    }
  };
  
  // Função para confirmar que os dados foram recebidos pelo middleware
  const confirmDataReceived = useCallback(async () => {
    log.info(`[UserContext:${userContextId}] Função confirmDataReceived chamada`);
    // TODO: Implementar confirmação quando necessário
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // userContextId é estático e não precisa ser incluído como dependência
  // Intencionalmente deixando o array de dependências vazio para evitar loop infinito
  // userContextId é estático e não muda entre renderizações

  // Efeito para carregar os dados do usuário via Server Action
  useEffect(() => {
    log.info(`[UserContext:${userContextId}] Montando UserContext - iniciando carregamento de dados`);
    
    const loadUserData = async () => {
      log.info(`[UserContext:${userContextId}] Iniciando carregamento de dados via Server Action`);
      setIsLoading(true);
      
      try {
        // Chamar a Server Action para obter os dados públicos
        const result = await getUserPublicData();
        
        if (result.success && result.data) {
          log.info(`[UserContext:${userContextId}] Dados recebidos com sucesso da Server Action`, {
            dataKeys: Object.keys(result.data),
            is_chatwoot_admin: result.data.is_chatwoot_admin,
          });
          
          // Atualizar o estado com os dados recebidos
          setUserData(result.data);
          setIsReady(true); // Marcar como pronto para renderização
        } else {
          log.warn(`[UserContext:${userContextId}] Falha ao obter dados da Server Action`, {
            error: result.error
          });
          // Em caso de falha, ainda marcamos como pronto para não bloquear a UI indefinidamente
          // mas mantemos userData como null
          setIsReady(true);
        }
      } catch (error) {
        log.error(`[UserContext:${userContextId}] Erro ao carregar dados do usuário:`, error);
        // Em caso de erro, ainda marcamos como pronto para não bloquear a UI indefinidamente
        setIsReady(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Iniciar carregamento dos dados
    loadUserData();
    
    return () => {
      log.info(`[UserContext:${userContextId}] UserContext sendo destruído`, {
        providersId
      });
    };
    // Intencionalmente deixando o array de dependências vazio para evitar loop infinito
    // userContextId e providersId são estáticos e não mudam entre renderizações
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Criar valor do contexto
  const contextValue: UserContextType = {
    userData,
    isLoading,
    isReady,
    signOut,
    confirmDataReceived,
  };

  log.info(`[UserContext:${userContextId}] Valor do contexto`, {
    hasUserData: !!userData,
    isReady,
    isLoading
  });

  // BLOQUEIO DO FLUXO: Não renderizar as children até que os dados estejam prontos
  if (!isReady) {
    log.info(`[UserContext:${userContextId}] Aguardando dados - bloqueando renderização das children`);
    return null; // Não renderiza nada enquanto os dados não estiverem prontos
  }

  log.info(`[UserContext:${userContextId}] Dados prontos - renderizando componentes filhos`);
  
  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}