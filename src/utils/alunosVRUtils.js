/**
 * Utilitários para processamento, classificação e métricas dos Alunos Virtuais 3D
 * lidos da chave classroom_configs/${salaId}/Alunos do Firebase RTDB.
 */

/**
 * Normaliza o valor de condição recebido do Firebase (ex: "TEA", "TDAH", "Típico", "Normal").
 * @param {string|any} cond 
 * @returns {'TEA'|'TDAH'|'Típico'}
 */
export const normalizarCondicaoAluno = (cond) => {
  if (!cond || typeof cond !== 'string') return 'Típico'
  const c = cond.trim().toUpperCase()
  if (c === 'TEA' || c.includes('AUTIS') || c.includes('ASPERGER')) return 'TEA'
  if (c === 'TDAH' || c.includes('ADHD') || c.includes('HIPERAT')) return 'TDAH'
  if (c.includes('TÍPICO') || c.includes('TIPICO') || c.includes('NORMAL') || c.includes('NEURO')) return 'Típico'
  return cond.trim()
}

/**
 * Extrai o índice numérico da chave do slot no RTDB (ex: "Aluno1" -> 1, "Aluno12" -> 12).
 * @param {string} key 
 * @returns {number}
 */
export const extrairIndiceSlot = (key) => {
  const match = String(key || '').match(/\d+/)
  return match ? parseInt(match[0], 10) : 9999
}

/**
 * Converte o nó Alunos bruto do Firebase em uma lista formatada,
 * contendo nome, condição (TEA / TDAH / Típico) e ordenação correta por assento/carteira.
 * 
 * @param {Object|Array|null} rawAlunos - Objeto classroom_configs[salaId].Alunos
 * @returns {Array<{ key: string, nome: string, condicao: string, isTEA: boolean, isTDAH: boolean, isTipico: boolean }>}
 */
export const parseAlunosVR = (rawAlunos) => {
  if (!rawAlunos) return []

  let list = []
  if (Array.isArray(rawAlunos)) {
    list = rawAlunos
      .filter(Boolean)
      .map((item, idx) => {
        let nome = ''
        let condicao = 'Típico'
        if (typeof item === 'string') {
          nome = item.trim()
        } else if (item && typeof item === 'object') {
          nome = (item.nome || item.name || '').trim()
          condicao = normalizarCondicaoAluno(item.condicao || item.condição || item.condition || item.tipo)
        }
        const condFinal = normalizarCondicaoAluno(condicao)
        return {
          key: `Aluno${idx + 1}`,
          nome,
          condicao: condFinal,
          isTEA: condFinal === 'TEA',
          isTDAH: condFinal === 'TDAH',
          isTipico: condFinal === 'Típico'
        }
      })
      .filter(a => a.nome.length > 0)
  } else if (typeof rawAlunos === 'object') {
    list = Object.entries(rawAlunos)
      .map(([key, val], idx) => {
        let nome = ''
        let condicao = 'Típico'
        if (typeof val === 'string') {
          nome = val.trim()
        } else if (val && typeof val === 'object') {
          nome = (val.nome || val.name || '').trim()
          condicao = normalizarCondicaoAluno(val.condicao || val.condição || val.condition || val.tipo)
        }
        const condFinal = normalizarCondicaoAluno(condicao)
        return {
          key,
          nome,
          condicao: condFinal,
          isTEA: condFinal === 'TEA',
          isTDAH: condFinal === 'TDAH',
          isTipico: condFinal === 'Típico'
        }
      })
      .filter(a => a.nome.length > 0)
      .sort((a, b) => extrairIndiceSlot(a.key) - extrairIndiceSlot(b.key))
  }

  return list
}

/**
 * Calcula totalizadores das características/condições da turma virtual.
 * @param {Array} alunosList 
 * @returns {{ total: number, tea: number, tdah: number, tipicos: number, pctTEA: number, pctTDAH: number, pctTipicos: number }}
 */
export const calcularMetricasCondicoesVR = (alunosList = []) => {
  const total = alunosList.length
  const tea = alunosList.filter(a => a.isTEA).length
  const tdah = alunosList.filter(a => a.isTDAH).length
  const tipicos = alunosList.filter(a => a.isTipico).length

  return {
    total,
    tea,
    tdah,
    tipicos,
    pctTEA: total > 0 ? Math.round((tea / total) * 100) : 0,
    pctTDAH: total > 0 ? Math.round((tdah / total) * 100) : 0,
    pctTipicos: total > 0 ? Math.round((tipicos / total) * 100) : 0
  }
}

/**
 * Retorna metadados visuais (ícone, cores, rótulo e classe CSS) para uma condição.
 * @param {string} condicao 
 */
export const getCondicaoBadgeMeta = (condicao) => {
  const c = normalizarCondicaoAluno(condicao)
  if (c === 'TEA') {
    return {
      label: 'TEA',
      fullLabel: 'Transtorno do Espectro Autista',
      icon: '🧩',
      cssClass: 'cond-tea',
      chipColor: '#2563eb',
      hasBadge: true
    }
  }
  if (c === 'TDAH') {
    return {
      label: 'TDAH',
      fullLabel: 'Déficit de Atenção e Hiperatividade',
      icon: '⚡',
      cssClass: 'cond-tdah',
      chipColor: '#d97706',
      hasBadge: true
    }
  }
  return {
    label: '',
    fullLabel: 'Desenvolvimento Típico',
    icon: '',
    cssClass: 'cond-tipico',
    chipColor: '#64748b',
    hasBadge: false
  }
}
