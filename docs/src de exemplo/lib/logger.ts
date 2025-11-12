import log from 'loglevel';
import prefix from 'loglevel-plugin-prefix';

// Configura o prefixo para mostrar o nome do arquivo de origem
prefix.reg(log);
prefix.apply(log, {
  format(level, name, timestamp) {
    return `[${timestamp}] ${level} ${name || 'global'}:`;
  },
  timestampFormatter(date) {
    return date.toISOString();
  },
  nameFormatter(name) {
    return name || 'global';
  },
  levelFormatter(level) {
    return level.toUpperCase();
  },
});

// Configuração padrão de logs - temporariamente em 'info' para diagnóstico
log.setLevel('info');

// Restaurar method factory original para permitir logs
const originalFactory = log.methodFactory;
log.methodFactory = originalFactory;

// Reconfigura o logger com o factory original
log.setLevel(log.getLevel());

export default log;
