/**
 * Utilitários para gestão do estado e situação de Salas VR.
 */

/**
 * Verifica se uma sala VR está com a situação atual ativa.
 * Padrão no banco: situacao_atual: { ativo: "sim" | "nao" }
 * 
 * @param {Object} sala - Objeto da sala VR
 * @returns {boolean} - true se a sala estiver ativa, false caso contrário
 */
export const isSalaAtiva = (sala) => {
  if (!sala) return false
  const situacao = sala.situacao_atual
  if (!situacao) return false

  // Caso padrão: objeto { ativo: "sim" }
  if (typeof situacao === 'object') {
    const val = situacao.ativo
    if (val === true) return true
    if (typeof val === 'string') {
      const normalizado = val.trim().toLowerCase()
      return normalizado === 'sim' || normalizado === 's' || normalizado === 'ativo' || normalizado === 'ativa'
    }
    return false
  }

  // Fallback caso venha como string direta ou booleano
  if (typeof situacao === 'string') {
    const normalizado = situacao.trim().toLowerCase()
    return normalizado === 'sim' || normalizado === 's' || normalizado === 'ativo' || normalizado === 'ativa'
  }

  if (situacao === true) return true

  return false
}

/**
 * Retorna o rótulo legível da situação da sala: 'Ativa' ou 'Inativa'
 * 
 * @param {Object} sala - Objeto da sala VR
 * @returns {string} - 'Ativa' ou 'Inativa'
 */
export const getSituacaoLabel = (sala) => {
  return isSalaAtiva(sala) ? 'Ativa' : 'Inativa'
}
