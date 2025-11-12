// Lista de nomes comuns brasileiros por gênero
const MALE_NAMES = new Set([
  'joao', 'josé', 'miguel', 'arthur', 'heitor', 'enzo', 'gabriel', 'bernardo', 'davi', 'lucas',
  'matheus', 'pedro', 'rafael', 'felipe', 'guilherme', 'gustavo', 'rodrigo', 'bruno', 'marcos', 'andré',
  'carlos', 'eduardo', 'vinicius', 'leonardo', 'alexandre', 'fernando', 'paulo', 'daniel', 'marcelo', 'ricardo',
  'thiago', 'felipe', 'lucas', 'henrique', 'roberto', 'marcelo', 'felipe', 'carlos', 'marcos', 'daniel'
]);

const FEMALE_NAMES = new Set([
  'maria', 'ana', 'sofia', 'alice', 'laura', 'helena', 'valentina', 'laura', 'isabella', 'manuela',
  'júlia', 'heloísa', 'luiza', 'maria eduarda', 'giovanna', 'beatriz', 'mariana', 'laura', 'larissa', 'amanda',
  'leticia', 'isabela', 'sarah', 'rafaela', 'carolina', 'camila', 'bruna', 'juliana', 'patricia', 'vanessa',
  'fernanda', 'tatiane', 'carol', 'aline', 'adriana', 'lucia', 'sandra', 'cristina', 'marina', 'claudia'
]);

export function getGenderFromName(name: string): 'male' | 'female' | 'unknown' {
  if (!name) return 'unknown';
  
  // Pega o primeiro nome e converte para minúsculas
  const firstName = name.trim().split(' ')[0].toLowerCase();
  
  // Remove acentos
  const normalized = firstName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  if (MALE_NAMES.has(normalized)) return 'male';
  if (FEMALE_NAMES.has(normalized)) return 'female';
  
  // Se não encontrar na lista, tenta adivinhar pelo final do nome
  if (normalized.endsWith('o') || normalized.endsWith('m') || normalized.endsWith('r') || 
      normalized.endsWith('s') || normalized.endsWith('l') || normalized.endsWith('u')) {
    return 'male';
  }
  
  if (normalized.endsWith('a') || normalized.endsWith('e') || normalized.endsWith('i') || 
      normalized.endsWith('z') || normalized.endsWith('h')) {
    return 'female';
  }
  
  return 'unknown';
}
