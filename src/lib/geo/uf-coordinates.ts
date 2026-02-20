/**
 * Coordenadas centrais e zoom sugerido para cada UF brasileira.
 * Usado para centralizar o mapa no estado da campanha ativa.
 * Fallback padrão: DF (centro geográfico do Brasil).
 */

export interface UfLocation {
  lat: number;
  lng: number;
  zoom: number;
}

export const UF_COORDINATES: Record<string, UfLocation> = {
  AC: { lat: -9.0238,   lng: -70.812,  zoom: 7 },
  AL: { lat: -9.5713,   lng: -36.782,  zoom: 8 },
  AM: { lat: -3.4168,   lng: -65.856,  zoom: 6 },
  AP: { lat: 1.4102,    lng: -51.770,  zoom: 7 },
  BA: { lat: -12.9714,  lng: -41.330,  zoom: 7 },
  CE: { lat: -5.4984,   lng: -39.320,  zoom: 7 },
  DF: { lat: -15.7801,  lng: -47.929,  zoom: 11 },
  ES: { lat: -19.1834,  lng: -40.308,  zoom: 8 },
  GO: { lat: -15.8270,  lng: -49.836,  zoom: 7 },
  MA: { lat: -5.4220,   lng: -45.440,  zoom: 7 },
  MG: { lat: -18.5122,  lng: -44.555,  zoom: 7 },
  MS: { lat: -20.7722,  lng: -54.785,  zoom: 7 },
  MT: { lat: -12.6819,  lng: -56.921,  zoom: 6 },
  PA: { lat: -3.4168,   lng: -52.000,  zoom: 6 },
  PB: { lat: -7.2399,   lng: -36.782,  zoom: 8 },
  PE: { lat: -8.8137,   lng: -36.954,  zoom: 7 },
  PI: { lat: -7.7183,   lng: -42.729,  zoom: 7 },
  PR: { lat: -24.8913,  lng: -51.899,  zoom: 7 },
  RJ: { lat: -22.6140,  lng: -42.640,  zoom: 8 },
  RN: { lat: -5.8127,   lng: -36.590,  zoom: 8 },
  RO: { lat: -10.8337,  lng: -62.035,  zoom: 7 },
  RR: { lat: 2.7376,    lng: -62.075,  zoom: 7 },
  RS: { lat: -30.0346,  lng: -51.217,  zoom: 7 },
  SC: { lat: -27.2423,  lng: -50.218,  zoom: 8 },
  SE: { lat: -10.5741,  lng: -37.385,  zoom: 8 },
  SP: { lat: -22.9068,  lng: -48.445,  zoom: 7 },
  TO: { lat: -10.1753,  lng: -48.298,  zoom: 7 },
};

/** UF de fallback quando campanha.uf não está disponível (centro geográfico do Brasil) */
export const UF_FALLBACK = 'DF';

/**
 * Retorna as coordenadas e zoom para a UF informada.
 * Se a UF for inválida ou nula, usa DF como fallback e loga warning.
 */
export function getUfLocation(uf: string | null | undefined): UfLocation {
  if (!uf || !UF_COORDINATES[uf]) {
    console.warn(`[geo] UF inválida ou não encontrada: "${uf}". Usando fallback: ${UF_FALLBACK}`);
    return UF_COORDINATES[UF_FALLBACK];
  }
  return UF_COORDINATES[uf];
}

/** Nomes completos dos estados — fonte única para todo o projeto */
export const UF_NAMES: Record<string, string> = {
  AC: 'Acre',              AL: 'Alagoas',           AM: 'Amazonas',
  AP: 'Amapá',             BA: 'Bahia',              CE: 'Ceará',
  DF: 'Distrito Federal',  ES: 'Espírito Santo',     GO: 'Goiás',
  MA: 'Maranhão',          MG: 'Minas Gerais',       MS: 'Mato Grosso do Sul',
  MT: 'Mato Grosso',       PA: 'Pará',               PB: 'Paraíba',
  PE: 'Pernambuco',        PI: 'Piauí',              PR: 'Paraná',
  RJ: 'Rio de Janeiro',    RN: 'Rio Grande do Norte', RO: 'Rondônia',
  RR: 'Roraima',           RS: 'Rio Grande do Sul',  SC: 'Santa Catarina',
  SE: 'Sergipe',           SP: 'São Paulo',           TO: 'Tocantins',
};
