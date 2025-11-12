import { SessionData } from './session';
import log from '@/lib/logger';
import WebSocket from 'ws';

/**
 * Implementação simplificada de EventEmitter compatível com Next.js
 * Evita problemas de importação do módulo events em ambiente browser
 */
class SimpleEventEmitter {
  private events: Record<string, Array<(...args: unknown[]) => void>> = {};

  on(event: string, listener: (...args: unknown[]) => void): this {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return this;
  }

  off(event: string, listener: (...args: unknown[]) => void): this {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(l => l !== listener);
    }
    return this;
  }

  emit(event: string, ...args: unknown[]): boolean {
    if (!this.events[event]) return false;
    
    this.events[event].forEach(listener => {
      listener(...args);
    });
    
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setMaxListeners(_n: number): this {
    // Método de compatibilidade com EventEmitter do Node.js
    // Não faz nada na nossa implementação simplificada
    return this;
  }
}

/**
 * Tipos de eventos emitidos pelo WebSocketService
 */
export enum WebSocketEventType {
  MESSAGE_RECEIVED = 'message_received',
  CONVERSATION_CREATED = 'conversation_created',
  CONVERSATION_UPDATED = 'conversation_updated',
  CONVERSATION_STATUS_CHANGED = 'conversation_status_changed',
  ASSIGNEE_CHANGED = 'assignee_changed',
  MESSAGE_CREATED = 'message_created',
  CONVERSATION_READ = 'conversation_read',
  PRESENCE_UPDATE = 'presence_update',
  TYPING_ON = 'typing_on',
  TYPING_OFF = 'typing_off',
  CONTACT_CREATED = 'contact_created',
  CONTACT_UPDATED = 'contact_updated',
  TEAM_CHANGED = 'team_changed',
  NOTIFICATION_CREATED = 'notification_created',
  CONNECTION_ERROR = 'connection_error',
  CONNECTION_ESTABLISHED = 'connection_established',
  CONNECTION_CLOSED = 'connection_closed'
}

/**
 * EventEmitter global para o WebSocketService
 * Permite que componentes se inscrevam para receber eventos do WebSocket
 */
export const webSocketEventEmitter = new SimpleEventEmitter();

// Aumentar o limite de listeners para evitar warnings
webSocketEventEmitter.setMaxListeners(30);

/**
 * Serviço singleton para gerenciar conexão WebSocket com Chatwoot
 * Mantém uma única conexão por instância do servidor
 */
class WebSocketService {
  private static instance: WebSocketService | null = null;
  private connection: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private connectionPromise: Promise<boolean> | null = null;
  
  // Dados de conexão
  private pubsubToken: string | null = null;
  private accountId: number | null = null;
  private userId: number | null = null;
  private wsUrl: string | null = null;
  
  // Status da conexão
  private isConnected = false;
  
  // Construtor privado para garantir singleton
  private constructor() {}
  
  /**
   * Obtém a instância única do serviço
   */
  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }
  
  /**
   * Verifica se o serviço já está conectado
   */
  public isActive(): boolean {
    return this.isConnected && this.connection !== null;
  }
  
  /**
   * Conecta ao WebSocket do Chatwoot
   * Retorna uma Promise que resolve para true se conectado com sucesso
   * @param session Dados da sessão com credenciais
   */
  public async connect(session: SessionData): Promise<boolean> {
    // Se já estiver conectado, retorna imediatamente
    if (this.isActive()) {
      log.info('[WebSocketService] Conexão já estabelecida, reutilizando');
      return true;
    }
    
    // Se já estiver tentando conectar, retorna a promise existente
    if (this.isConnecting && this.connectionPromise) {
      log.info('[WebSocketService] Conexão em andamento, aguardando');
      return this.connectionPromise;
    }
    
    // Verifica se temos as credenciais necessárias
    if (!session.pubsub_token || !session.account_id) {
      log.error('[WebSocketService] Credenciais insuficientes para conexão WebSocket', {
        hasPubSubToken: !!session.pubsub_token,
        hasAccountId: !!session.account_id
      });
      return false;
    }
    
    // Armazena as credenciais
    this.pubsubToken = session.pubsub_token;
    this.accountId = session.account_id;
    this.userId = session.chatwoot_id || undefined;
    
    // Constrói a URL do WebSocket
    const baseUrl = process.env.CHATWOOT_BASE_URL || 'https://chatwoot.virtuetech.com.br';
    this.wsUrl = baseUrl.replace('http', 'ws').replace('https', 'wss') + '/cable';
    
    // Marca que está tentando conectar
    this.isConnecting = true;
    
    // Cria uma promise para a conexão
    this.connectionPromise = new Promise<boolean>((resolve) => {
      try {
        log.info('[WebSocketService] Iniciando conexão com', { wsUrl: this.wsUrl });
        
        // Cria a conexão WebSocket
        this.connection = new WebSocket(this.wsUrl);
        
        // Configura os handlers de eventos
        this.connection.on('open', () => {
          log.info('[WebSocketService] Conexão estabelecida');
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // Envia comando de subscribe
          this.subscribe();
          
          // Inicia heartbeat
          this.startHeartbeat();
          
          resolve(true);
        });
        
        this.connection.on('close', () => {
          log.info('[WebSocketService] Conexão fechada');
          this.isConnected = false;
          this.cleanup();
          this.scheduleReconnect();
          
          // Se ainda estiver conectando, resolve como falha
          if (this.isConnecting) {
            this.isConnecting = false;
            resolve(false);
          }
        });
        
        this.connection.on('error', (error) => {
          log.error('[WebSocketService] Erro na conexão', error);
          this.isConnected = false;
          
          // Se ainda estiver conectando, resolve como falha
          if (this.isConnecting) {
            this.isConnecting = false;
            resolve(false);
          }
        });
        
        this.connection.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            
            // Ignora mensagens de tipo welcome e ping
            if (message.type === 'welcome' || message.type === 'ping') {
              return;
            }
            
            // Processa a mensagem recebida
            if (message.message) {
              const { event, data: eventData, type } = message.message;
              
              log.debug('[WebSocketService] Mensagem recebida', {
                event,
                type,
                hasData: !!eventData
              });
              
              // Processa e emite o evento para os listeners
              this.processWebSocketEvent(event, type, eventData);
            }
          } catch (err) {
            log.error('[WebSocketService] Erro ao processar mensagem', err);
            // Emite evento de erro para os listeners
            webSocketEventEmitter.emit(WebSocketEventType.CONNECTION_ERROR, err);
          }
        });
        
        // Emite evento de conexão estabelecida
        this.connection.on('open', () => {
          webSocketEventEmitter.emit(WebSocketEventType.CONNECTION_ESTABLISHED);
        });
        
        // Emite evento de conexão fechada
        this.connection.on('close', () => {
          webSocketEventEmitter.emit(WebSocketEventType.CONNECTION_CLOSED);
        });
        
      } catch (error) {
        log.error('[WebSocketService] Erro ao iniciar conexão', error);
        this.isConnecting = false;
        resolve(false);
      }
    });
    
    return this.connectionPromise;
  }
  
  /**
   * Envia comando de subscribe para o WebSocket
   */
  private subscribe(): void {
    if (!this.connection || !this.isConnected || !this.pubsubToken || !this.accountId) {
      return;
    }
    
    try {
      const subscribePayload = {
        command: "subscribe",
        identifier: JSON.stringify({
          channel: "RoomChannel",
          pubsub_token: this.pubsubToken,
          account_id: this.accountId,
          ...(this.userId ? { user_id: this.userId } : {})
        })
      };
      
      this.connection.send(JSON.stringify(subscribePayload));
      log.info('[WebSocketService] Inscrição enviada');
      
      // Inicia envio periódico de presença
      this.startPresenceUpdates();
    } catch (error) {
      log.error('[WebSocketService] Erro ao enviar inscrição', error);
    }
  }
  
  /**
   * Processa eventos recebidos do WebSocket e emite para os listeners
   * @param event Nome do evento recebido
   * @param type Tipo do evento
   * @param data Dados associados ao evento
   */
  private processWebSocketEvent(event: string, type: string, data: any): void {
    // Normaliza o nome do evento (remove prefixos e sufixos comuns)
    const normalizedEvent = this.normalizeEventName(event);
    
    // Classifica e emite o evento apropriado
    switch (normalizedEvent) {
      case 'conversation_created':
        webSocketEventEmitter.emit(WebSocketEventType.CONVERSATION_CREATED, data);
        break;
        
      case 'conversation_updated':
      case 'conversation_status_changed':
        webSocketEventEmitter.emit(WebSocketEventType.CONVERSATION_UPDATED, data);
        break;
        
      case 'message_created':
        webSocketEventEmitter.emit(WebSocketEventType.MESSAGE_CREATED, data);
        break;
        
      case 'message_updated':
        webSocketEventEmitter.emit(WebSocketEventType.MESSAGE_RECEIVED, data);
        break;
        
      case 'conversation_read':
        webSocketEventEmitter.emit(WebSocketEventType.CONVERSATION_READ, data);
        break;
        
      case 'assignee_changed':
        webSocketEventEmitter.emit(WebSocketEventType.ASSIGNEE_CHANGED, data);
        break;
        
      case 'team_changed':
        webSocketEventEmitter.emit(WebSocketEventType.TEAM_CHANGED, data);
        break;
        
      case 'typing_on':
        webSocketEventEmitter.emit(WebSocketEventType.TYPING_ON, data);
        break;
        
      case 'typing_off':
        webSocketEventEmitter.emit(WebSocketEventType.TYPING_OFF, data);
        break;
        
      case 'presence_update':
        webSocketEventEmitter.emit(WebSocketEventType.PRESENCE_UPDATE, data);
        break;
        
      case 'contact_created':
        webSocketEventEmitter.emit(WebSocketEventType.CONTACT_CREATED, data);
        break;
        
      case 'contact_updated':
        webSocketEventEmitter.emit(WebSocketEventType.CONTACT_UPDATED, data);
        break;
        
      case 'notification_created':
        webSocketEventEmitter.emit(WebSocketEventType.NOTIFICATION_CREATED, data);
        break;
        
      default:
        // Para eventos não mapeados, logamos para análise futura
        log.debug('[WebSocketService] Evento não mapeado:', {
          event: normalizedEvent,
          type,
          data
        });
        break;
    }
  }
  
  /**
   * Normaliza o nome do evento removendo prefixos e sufixos comuns
   * @param eventName Nome do evento original
   * @returns Nome do evento normalizado
   */
  private normalizeEventName(eventName: string): string {
    // Remove prefixos comuns como 'conversation.' ou sufixos como '.created'
    let normalized = eventName.toLowerCase();
    
    // Remove prefixos
    const prefixes = ['conversation.', 'message.', 'contact.', 'notification.'];
    for (const prefix of prefixes) {
      if (normalized.startsWith(prefix)) {
        normalized = normalized.substring(prefix.length);
        break;
      }
    }
    
    return normalized;
  }
  
  /**
   * Inicia envio periódico de atualizações de presença
   */
  private startPresenceUpdates(): void {
    // Limpa intervalo existente
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    // Configura novo intervalo (30 segundos)
    this.heartbeatInterval = setInterval(() => {
      this.updatePresence();
    }, 30000);
  }
  
  /**
   * Envia atualização de presença para manter status online
   */
  private updatePresence(): void {
    if (!this.connection || !this.isConnected || !this.pubsubToken || !this.accountId) {
      return;
    }
    
    try {
      const presencePayload = {
        command: "message",
        identifier: JSON.stringify({
          channel: "RoomChannel",
          pubsub_token: this.pubsubToken,
          account_id: this.accountId,
          ...(this.userId ? { user_id: this.userId } : {})
        }),
        data: JSON.stringify({ action: "update_presence" })
      };
      
      this.connection.send(JSON.stringify(presencePayload));
      log.debug('[WebSocketService] Presença atualizada');
    } catch (error) {
      log.error('[WebSocketService] Erro ao enviar atualização de presença', error);
    }
  }
  
  /**
   * Inicia verificação periódica da conexão
   */
  private startHeartbeat(): void {
    // Configura verificação a cada 45 segundos
    setInterval(() => {
      if (this.connection && this.connection.readyState === WebSocket.OPEN) {
        // Conexão está ativa, não precisa fazer nada
      } else {
        // Conexão caiu, tenta reconectar
        this.reconnect();
      }
    }, 45000);
  }
  
  /**
   * Agenda uma tentativa de reconexão
   */
  private scheduleReconnect(): void {
    // Limpa timeout existente
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    // Verifica se já excedeu o número máximo de tentativas
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      log.error('[WebSocketService] Número máximo de tentativas de reconexão excedido');
      return;
    }
    
    // Calcula tempo de espera com backoff exponencial
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    
    log.info(`[WebSocketService] Agendando reconexão em ${delay}ms (tentativa ${this.reconnectAttempts})`);
    
    // Agenda reconexão
    this.reconnectTimeout = setTimeout(() => {
      this.reconnect();
    }, delay);
  }
  
  /**
   * Tenta reconectar ao WebSocket
   */
  private async reconnect(): Promise<void> {
    // Limpa recursos existentes
    this.cleanup();
    
    // Verifica se temos as credenciais necessárias
    if (!this.pubsubToken || !this.accountId || !this.wsUrl) {
      log.error('[WebSocketService] Credenciais insuficientes para reconexão');
      return;
    }
    
    try {
      log.info('[WebSocketService] Tentando reconectar...');
      
      // Cria nova conexão
      this.connection = new WebSocket(this.wsUrl);
      
      // Configura handlers novamente
      this.connection.on('open', () => {
        log.info('[WebSocketService] Reconexão bem-sucedida');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Envia comando de subscribe
        this.subscribe();
      });
      
      this.connection.on('close', () => {
        log.info('[WebSocketService] Reconexão fechada');
        this.isConnected = false;
        this.cleanup();
        this.scheduleReconnect();
      });
      
      this.connection.on('error', (error) => {
        log.error('[WebSocketService] Erro na reconexão', error);
        this.isConnected = false;
        this.scheduleReconnect();
      });
      
      this.connection.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          
          // Ignora mensagens de tipo welcome e ping
          if (message.type === 'welcome' || message.type === 'ping') {
            return;
          }
          
          // Processa a mensagem recebida
          if (message.message) {
            log.debug('[WebSocketService] Mensagem recebida na reconexão', {
              event: message.message.event,
              type: message.message.type
            });
          }
        } catch (err) {
          log.error('[WebSocketService] Erro ao processar mensagem na reconexão', err);
        }
      });
      
    } catch (error) {
      log.error('[WebSocketService] Erro ao tentar reconectar', error);
      this.scheduleReconnect();
    }
  }
  
  /**
   * Limpa recursos da conexão
   */
  private cleanup(): void {
    // Limpa intervalo de heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    // Fecha conexão existente
    if (this.connection) {
      try {
        // Remove todos os listeners para evitar vazamentos de memória
        this.connection.removeAllListeners();
        
        // Fecha a conexão se ainda estiver aberta
        if (this.connection.readyState === WebSocket.OPEN) {
          this.connection.close();
        }
      } catch (error) {
        log.error('[WebSocketService] Erro ao limpar conexão', error);
      }
      
      this.connection = null;
    }
    
    this.isConnected = false;
  }
  
  /**
   * Desconecta o WebSocket
   */
  public disconnect(): void {
    log.info('[WebSocketService] Desconectando WebSocket');
    this.cleanup();
    
    // Limpa timeout de reconexão
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    // Reseta estado
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.connectionPromise = null;
  }
}

/**
 * Função para obter a instância única do serviço WebSocket
 */
export function getWebSocketService(): WebSocketService {
  return WebSocketService.getInstance();
}

/**
 * Função para inicializar o serviço WebSocket com dados da sessão
 * @param session Dados da sessão com credenciais
 */
export async function initializeWebSocketService(session: SessionData): Promise<boolean> {
  const service = getWebSocketService();
  
  // Se já estiver conectado, retorna true
  if (service.isActive()) {
    return true;
  }
  
  // Tenta conectar
  return await service.connect(session);
}

/**
 * Função auxiliar para emitir eventos de teste
 * Útil para verificar se os componentes estão reagindo corretamente aos eventos
 * @param eventType Tipo de evento a ser emitido
 * @param data Dados do evento
 */
export function emitTestEvent(eventType: WebSocketEventType, data: object): void {
  log.info('[WebSocketService] Emitindo evento de teste', { eventType, data });
  webSocketEventEmitter.emit(eventType, data);
}
