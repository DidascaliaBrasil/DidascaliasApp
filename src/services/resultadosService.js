import { ref as dbRef, get } from 'firebase/database'
import { database } from '../firebase'

/**
 * Normaliza um ID para comparação segura e padronizada
 */
export function normalizarId(id) {
  if (id === null || id === undefined) return ''
  return String(id).trim().toUpperCase()
}

/**
 * Verifica se um ID de participante de sessão pertence a um usuário
 */
export function isParticipantUser(participantId, user) {
  if (!participantId || !user) return false
  const pNorm = normalizarId(participantId)
  const uId = normalizarId(user.id)
  const uUid = normalizarId(user.uid || user.authUid)
  const uShort = uUid ? uUid.substring(0, 8) : ''

  return pNorm === uId || pNorm === uUid || (uShort && pNorm === uShort)
}

/**
 * Formata duração em segundos para formato legível (ex: "1m 30s", "45s" ou "2h 10m")
 */
export function formatarDuracao(segundos) {
  const seg = Math.round(Number(segundos) || 0)
  if (seg <= 0) return '0s'

  const horas = Math.floor(seg / 3600)
  const minutos = Math.floor((seg % 3600) / 60)
  const segRestantes = seg % 60

  if (horas > 0) {
    return `${horas}h ${minutos}m ${segRestantes}s`
  }
  if (minutos > 0) {
    return `${minutos}m ${segRestantes}s`
  }
  return `${segRestantes}s`
}

/**
 * Formata data ISO para formato pt-BR
 */
export function formatarData(isoStr, formato = 'completo') {
  if (!isoStr) return 'Data não informada'
  try {
    const d = new Date(isoStr)
    if (isNaN(d.getTime())) return String(isoStr)

    if (formato === 'curto') {
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }
    if (formato === 'data') {
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }
    if (formato === 'hora') {
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return String(isoStr)
  }
}

/**
 * Retorna o ícone e cor correspondente a uma ação / intent VR
 */
export function getMetaIntent(nomeIntent) {
  const lower = String(nomeIntent || '').toLowerCase()

  if (lower.includes('silencio') || lower.includes('silêncio')) {
    return { label: 'Silêncio', icon: '🤫', color: '#0071e3', bg: '#eff6ff' }
  }
  if (lower.includes('sentar') || lower.includes('sentarse')) {
    return { label: 'Sentar-se', icon: '🪑', color: '#10b981', bg: '#ecfdf5' }
  }
  if (lower.includes('expuls') || lower.includes('expulsao') || lower.includes('expulsão')) {
    return { label: 'Expulsão', icon: '🚪', color: '#ef4444', bg: '#fef2f2' }
  }
  if (lower.includes('trocar') || lower.includes('trocaraluno')) {
    return { label: 'Trocar Aluno', icon: '🔄', color: '#f59e0b', bg: '#fffbeb' }
  }
  if (lower.includes('atencao') || lower.includes('atenção')) {
    return { label: 'Atenção', icon: '👀', color: '#8b5cf6', bg: '#f5f3ff' }
  }
  if (lower.includes('elogio') || lower.includes('parabens')) {
    return { label: 'Elogio', icon: '⭐', color: '#06b6d4', bg: '#ecfeff' }
  }

  return { label: nomeIntent || 'Ação VR', icon: '⚡', color: '#64748b', bg: '#f1f5f9' }
}

/**
 * Normaliza o objeto de Resultados de uma sala em um array ordenado de sessões
 */
export function extrairSessoes(sala, usuariosMap = {}, participantesGrupo = []) {
  if (!sala || !sala.Resultados) return []

  const resultadosRaw = sala.Resultados
  const sessoesList = []

  const keys = Object.keys(resultadosRaw)
  for (const key of keys) {
    const raw = resultadosRaw[key]
    if (!raw || typeof raw !== 'object') continue

    // Extrai dados da sessão
    const pId = raw.activeParticipantId || raw.participantId || raw.alunoId || ''
    const pIdNorm = normalizarId(pId)

    // Tenta resolver dados do participante
    let alunoObj = null

    // 1. Busca no mapa de usuários geral
    if (pId && usuariosMap[pId]) alunoObj = usuariosMap[pId]
    if (!alunoObj && pIdNorm && usuariosMap[pIdNorm]) alunoObj = usuariosMap[pIdNorm]

    // 2. Busca por prefixo/shortId
    if (!alunoObj && pIdNorm) {
      for (const uKey in usuariosMap) {
        const normUKey = normalizarId(uKey)
        if (normUKey === pIdNorm || (normUKey.length >= 8 && pIdNorm.startsWith(normUKey.substring(0, 8)))) {
          alunoObj = usuariosMap[uKey]
          break
        }
      }
    }

    // 3. Busca na lista de participantes do grupo
    if (!alunoObj && Array.isArray(participantesGrupo)) {
      alunoObj = participantesGrupo.find(p => normalizarId(p.id) === pIdNorm)
    }

    const alunoNome = alunoObj?.nome || (pId ? `Aluno (${pId.substring(0, 8)})` : 'Participante Anônimo')
    const alunoEmail = alunoObj?.email || ''
    const alunoId = alunoObj?.id || pId || `anon_${key}`

    // Normaliza Intents Detalhadas
    const intentsObj = raw.intentsDetalhada || raw.intentsDetalhadas || raw.intents || {}
    const intentsArray = []
    let somaIntents = 0

    if (typeof intentsObj === 'object' && intentsObj !== null) {
      for (const intentKey of Object.keys(intentsObj)) {
        const qtd = Number(intentsObj[intentKey]) || 0
        somaIntents += qtd
        const meta = getMetaIntent(intentKey)
        intentsArray.push({
          chaveOriginal: intentKey,
          label: meta.label,
          icon: meta.icon,
          color: meta.color,
          bg: meta.bg,
          quantidade: qtd
        })
      }
    }

    // Ordena intents por quantidade desc
    intentsArray.sort((a, b) => b.quantidade - a.quantidade)

    const duracaoSegundos = Number(raw.duracaoSegundos || raw.duracao || raw.duracao_segundos || 0)
    const dataInicio = raw.dataInicio || raw.data || raw.criadoEm || raw.timestamp || ''
    const totalIntents = Number(raw.totalIntents || raw.total_intents || somaIntents)

    sessoesList.push({
      id: key,
      sessaoKey: key,
      salaId: sala.id,
      salaNome: sala.roomName || 'Sala VR',
      facilitadorId: sala.facilitadorId,
      facilitadorNome: sala.facilitadorNome || 'Facilitador',
      instituicaoId: sala.instituicaoId,
      dataInicio,
      duracaoSegundos,
      duracaoFormatada: formatarDuracao(duracaoSegundos),
      totalIntents,
      intentsDetalhada: intentsObj,
      intentsArray,
      activeParticipantId: pId,
      alunoId,
      alunoNome,
      alunoEmail,
      alunoAvatar: (alunoNome.charAt(0) || 'U').toUpperCase()
    })
  }

  // Ordena sessões por data desc (mais recente primeiro)
  sessoesList.sort((a, b) => {
    const timeA = new Date(a.dataInicio || 0).getTime() || 0
    const timeB = new Date(b.dataInicio || 0).getTime() || 0
    return timeB - timeA
  })

  return sessoesList
}

/**
 * Busca todos os dados completos (salas, usuários, grupos, sessões) de uma instituição de forma resiliente
 * Aceita múltiplos identificadores (ou array) para garantir correspondência total
 */
export async function carregarDadosCompletosInstituicao(identificadorInstituicao, idsAlternativos = []) {
  if (!identificadorInstituicao && (!idsAlternativos || idsAlternativos.length === 0)) {
    return { usuarios: [], usuariosMap: {}, grupos: [], gruposMap: {}, salas: [], sessoesTodas: [] }
  }

  // Monta conjunto de IDs normalizados para busca
  const idsSet = new Set()
  
  if (Array.isArray(identificadorInstituicao)) {
    identificadorInstituicao.forEach(id => { if (id) idsSet.add(normalizarId(id)) })
  } else if (typeof identificadorInstituicao === 'object' && identificadorInstituicao !== null) {
    if (identificadorInstituicao.id) idsSet.add(normalizarId(identificadorInstituicao.id))
    if (identificadorInstituicao.instituicaoId) idsSet.add(normalizarId(identificadorInstituicao.instituicaoId))
    if (identificadorInstituicao.idCurto) idsSet.add(normalizarId(identificadorInstituicao.idCurto))
    if (identificadorInstituicao.authUid) idsSet.add(normalizarId(identificadorInstituicao.authUid))
  } else if (identificadorInstituicao) {
    idsSet.add(normalizarId(identificadorInstituicao))
  }

  if (Array.isArray(idsAlternativos)) {
    idsAlternativos.forEach(id => { if (id) idsSet.add(normalizarId(id)) })
  }

  const matchId = (val) => {
    if (!val) return false
    const norm = normalizarId(val)
    for (const instId of idsSet) {
      if (norm === instId || (instId.length >= 8 && norm.startsWith(instId.substring(0, 8)))) {
        return true
      }
    }
    return false
  }

  try {
    // 1. Buscar todos os Usuários da Instituição
    const usersRef = dbRef(database, 'usuarios')
    const usersSnap = await get(usersRef)
    const usuariosList = []
    const usuariosMap = {}
    const facilitadoresIdsSet = new Set()

    if (usersSnap.exists()) {
      const rawUsers = usersSnap.val()
      for (const k in rawUsers) {
        const u = rawUsers[k]
        if (!u) continue

        const pertence = matchId(u.instituicaoId) || idsSet.has(normalizarId(k))
        if (pertence) {
          const userObj = { id: k, ...u }
          usuariosList.push(userObj)
          usuariosMap[k] = userObj
          usuariosMap[normalizarId(k)] = userObj
          
          const tipo = (u.tipoCadastro || u.tipo || '').toLowerCase()
          if (tipo.includes('facilitador')) {
            facilitadoresIdsSet.add(k)
            facilitadoresIdsSet.add(normalizarId(k))
            if (u.idCurto) facilitadoresIdsSet.add(normalizarId(u.idCurto))
            if (u.authUid) facilitadoresIdsSet.add(normalizarId(u.authUid))
          }
        }
      }
    }

    // 2. Buscar Grupos da Instituição (varre todos os nós de instituição possíveis)
    const gruposList = []
    const gruposMap = {}
    const gruposChavesJaProcessadas = new Set()

    for (const instId of idsSet) {
      const gruposRef = dbRef(database, `instituicoes/${instId}/grupos`)
      const gruposSnap = await get(gruposRef)
      if (gruposSnap.exists()) {
        const rawGrupos = gruposSnap.val()
        for (const k in rawGrupos) {
          if (!gruposChavesJaProcessadas.has(k)) {
            gruposChavesJaProcessadas.add(k)
            const g = { id: k, ...rawGrupos[k] }
            gruposList.push(g)
            gruposMap[k] = g
          }
        }
      }
    }

    // 3. Buscar Salas de Aula VR (classroom_configs)
    const salasRef = dbRef(database, 'classroom_configs')
    const salasSnap = await get(salasRef)
    const salasList = []
    let sessoesTodas = []

    if (salasSnap.exists()) {
      const rawSalas = salasSnap.val()
      for (const k in rawSalas) {
        const s = rawSalas[k]
        if (!s) continue

        // Verifica se a sala pertence à instituição (por instituicaoId direto OU por facilitador da instituição)
        const pertenceInstituicao = matchId(s.instituicaoId) || 
                                    facilitadoresIdsSet.has(s.facilitadorId) || 
                                    facilitadoresIdsSet.has(normalizarId(s.facilitadorId))

        if (pertenceInstituicao) {
          // Determina alunos vinculados à sala
          let alunosVinculados = []
          let nomeAlvo = ''

          if (s.targetType === 'grupo' && s.targetId && gruposMap[s.targetId]) {
            const grp = gruposMap[s.targetId]
            nomeAlvo = grp.nome || 'Grupo / Turma'
            alunosVinculados = Array.isArray(grp.participantes) ? grp.participantes : []
          } else if (s.targetType === 'aluno' && s.targetId) {
            const al = usuariosMap[s.targetId] || usuariosMap[normalizarId(s.targetId)]
            if (al) {
              nomeAlvo = al.nome || 'Aluno Individual'
              alunosVinculados = [{ id: s.targetId, nome: al.nome, email: al.email || '', tipo: al.tipo || 'Aluno' }]
            } else {
              nomeAlvo = `Aluno (${s.targetId})`
              alunosVinculados = [{ id: s.targetId, nome: nomeAlvo, email: '' }]
            }
          } else {
            nomeAlvo = s.roomName || 'Sala VR'
          }

          // Nome do Facilitador Responsável
          const facilitadorObj = usuariosMap[s.facilitadorId] || usuariosMap[normalizarId(s.facilitadorId)]
          const facilitadorNome = facilitadorObj?.nome || (s.facilitadorId ? `Facilitador (${s.facilitadorId.substring(0, 8)})` : 'Não informado')

          // Extrai e normaliza sessões
          const sessoes = extrairSessoes({ id: k, ...s, facilitadorNome }, usuariosMap, alunosVinculados)
          sessoesTodas = sessoesTodas.concat(sessoes)

          // Calcula estatísticas consolidadas da sala
          const totalSessoes = sessoes.length
          const tempoTotalSegundos = sessoes.reduce((acc, sess) => acc + sess.duracaoSegundos, 0)
          const tempoMedioSegundos = totalSessoes > 0 ? Math.round(tempoTotalSegundos / totalSessoes) : 0
          const totalIntentsSala = sessoes.reduce((acc, sess) => acc + sess.totalIntents, 0)

          // Participantes únicos que já jogaram
          const participantesUnicosIds = [...new Set(sessoes.map(sess => normalizarId(sess.alunoId || sess.activeParticipantId)))].filter(Boolean)
          
          const totalAlunosVinculados = alunosVinculados.length
          const taxaConclusao = totalAlunosVinculados > 0 
            ? Math.min(100, Math.round((participantesUnicosIds.length / totalAlunosVinculados) * 100))
            : (totalSessoes > 0 ? 100 : 0)

          salasList.push({
            id: k,
            ...s,
            facilitadorNome,
            facilitadorObj,
            nomeAlvo,
            alunosVinculados,
            sessoes,
            totalSessoes,
            tempoTotalSegundos,
            tempoTotalFormatado: formatarDuracao(tempoTotalSegundos),
            tempoMedioSegundos,
            tempoMedioFormatado: formatarDuracao(tempoMedioSegundos),
            totalIntentsSala,
            participantesUnicosIds,
            taxaConclusao
          })
        }
      }
    }

    // Ordena salas por data de criação desc
    salasList.sort((a, b) => new Date(b.criadoEm || 0) - new Date(a.criadoEm || 0))

    // Ordena sessões por data desc
    sessoesTodas.sort((a, b) => new Date(b.dataInicio || 0) - new Date(a.dataInicio || 0))

    return {
      usuarios: usuariosList,
      usuariosMap,
      grupos: gruposList,
      gruposMap,
      salas: salasList,
      sessoesTodas
    }
  } catch (error) {
    console.error('Erro ao carregar dados da instituição:', error)
    return { usuarios: [], usuariosMap: {}, grupos: [], gruposMap: {}, salas: [], sessoesTodas: [] }
  }
}

/**
 * Calcula todas as métricas consolidadas, séries temporais e estatísticas para os gráficos
 */
export function processarMetricasInstituicao(dados) {
  const { salas = [], usuarios = [], grupos = [], sessoesTodas = [] } = dados

  const totalSalas = salas.length
  const totalSessoes = sessoesTodas.length
  const tempoTotalSegundos = sessoesTodas.reduce((acc, s) => acc + s.duracaoSegundos, 0)
  const tempoMedioSegundos = totalSessoes > 0 ? Math.round(tempoTotalSegundos / totalSessoes) : 0
  const totalIntentsGeral = sessoesTodas.reduce((acc, s) => acc + s.totalIntents, 0)

  // Alunos participantes únicos
  const alunosParticipantesSet = new Set(
    sessoesTodas.map(s => normalizarId(s.alunoId || s.activeParticipantId)).filter(Boolean)
  )
  const totalAlunosParticipantes = alunosParticipantesSet.size

  // Agregação global de Intents
  const intentsGlobaisMap = {}
  for (const s of sessoesTodas) {
    for (const item of s.intentsArray) {
      if (!intentsGlobaisMap[item.label]) {
        intentsGlobaisMap[item.label] = {
          label: item.label,
          icon: item.icon,
          color: item.color,
          bg: item.bg,
          quantidade: 0
        }
      }
      intentsGlobaisMap[item.label].quantidade += item.quantidade
    }
  }

  const intentsGlobaisList = Object.values(intentsGlobaisMap)
    .map(i => ({
      ...i,
      percentual: totalIntentsGeral > 0 ? ((i.quantidade / totalIntentsGeral) * 100).toFixed(1) : '0'
    }))
    .sort((a, b) => b.quantidade - a.quantidade)

  // Desempenho por Facilitador
  const facilitadoresMap = {}
  const facilitadoresCadastrados = usuarios.filter(u =>
    (u.tipoCadastro || u.tipo || '').toLowerCase().includes('facilitador')
  )

  for (const f of facilitadoresCadastrados) {
    facilitadoresMap[f.id] = {
      id: f.id,
      nome: f.nome,
      email: f.email,
      salasCriadas: 0,
      sessoesExecutadas: 0,
      tempoTotalSegundos: 0,
      totalIntents: 0,
      salas: [],
      grupos: [],
      intentsMap: {}
    }
  }

  // Vincula grupos aos facilitadores
  for (const g of grupos) {
    const fId = g.facilitadorId
    if (fId && facilitadoresMap[fId]) {
      facilitadoresMap[fId].grupos.push(g)
    }
  }

  // Popula com dados das salas
  for (const sala of salas) {
    const fId = sala.facilitadorId || 'desconhecido'
    if (!facilitadoresMap[fId]) {
      facilitadoresMap[fId] = {
        id: fId,
        nome: sala.facilitadorNome || `Facilitador (${fId.substring(0, 8)})`,
        email: '',
        salasCriadas: 0,
        sessoesExecutadas: 0,
        tempoTotalSegundos: 0,
        totalIntents: 0,
        salas: [],
        grupos: [],
        intentsMap: {}
      }
    }
    facilitadoresMap[fId].salasCriadas += 1
    facilitadoresMap[fId].sessoesExecutadas += sala.totalSessoes
    facilitadoresMap[fId].tempoTotalSegundos += sala.tempoTotalSegundos
    facilitadoresMap[fId].totalIntents += sala.totalIntentsSala
    facilitadoresMap[fId].salas.push(sala)

    // Agrega intents do facilitador
    for (const sess of sala.sessoes) {
      for (const item of sess.intentsArray) {
        if (!facilitadoresMap[fId].intentsMap[item.label]) {
          facilitadoresMap[fId].intentsMap[item.label] = { ...item, quantidade: 0 }
        }
        facilitadoresMap[fId].intentsMap[item.label].quantidade += item.quantidade
      }
    }
  }

  const facilitadoresList = Object.values(facilitadoresMap).map(f => {
    const intentsList = Object.values(f.intentsMap).sort((a, b) => b.quantidade - a.quantidade)
    return {
      ...f,
      tempoTotalFormatado: formatarDuracao(f.tempoTotalSegundos),
      tempoMedioPorSessao: f.sessoesExecutadas > 0 ? formatarDuracao(f.tempoTotalSegundos / f.sessoesExecutadas) : '0s',
      percentualSessoes: totalSessoes > 0 ? ((f.sessoesExecutadas / totalSessoes) * 100).toFixed(0) : '0',
      intentsList,
      principalAcao: intentsList.length > 0 ? intentsList[0] : null
    }
  }).sort((a, b) => b.sessoesExecutadas - a.sessoesExecutadas || b.salasCriadas - a.salasCriadas)

  // Desempenho por Aluno
  const alunosMap = {}
  const alunosCadastrados = usuarios.filter(u =>
    (u.tipoCadastro || u.tipo || '').toLowerCase().includes('usuario')
  )

  for (const a of alunosCadastrados) {
    alunosMap[a.id] = {
      id: a.id,
      nome: a.nome,
      email: a.email,
      totalSessoes: 0,
      tempoTotalSegundos: 0,
      totalIntents: 0,
      intentsMap: {},
      salasParticipadas: [],
      sessoes: []
    }
  }

  for (const s of sessoesTodas) {
    const aId = s.alunoId || s.activeParticipantId || 'anonimo'
    if (!alunosMap[aId]) {
      alunosMap[aId] = {
        id: aId,
        nome: s.alunoNome,
        email: s.alunoEmail,
        totalSessoes: 0,
        tempoTotalSegundos: 0,
        totalIntents: 0,
        intentsMap: {},
        salasParticipadas: [],
        sessoes: []
      }
    }
    alunosMap[aId].totalSessoes += 1
    alunosMap[aId].tempoTotalSegundos += s.duracaoSegundos
    alunosMap[aId].totalIntents += s.totalIntents
    alunosMap[aId].sessoes.push(s)

    if (s.salaNome && !alunosMap[aId].salasParticipadas.includes(s.salaNome)) {
      alunosMap[aId].salasParticipadas.push(s.salaNome)
    }

    for (const item of s.intentsArray) {
      if (!alunosMap[aId].intentsMap[item.label]) {
        alunosMap[aId].intentsMap[item.label] = { ...item, quantidade: 0 }
      }
      alunosMap[aId].intentsMap[item.label].quantidade += item.quantidade
    }
  }

  const alunosList = Object.values(alunosMap).map(a => {
    const intentsList = Object.values(a.intentsMap).sort((x, y) => y.quantidade - x.quantidade)
    return {
      ...a,
      tempoTotalFormatado: formatarDuracao(a.tempoTotalSegundos),
      tempoMedioFormatado: a.totalSessoes > 0 ? formatarDuracao(a.tempoTotalSegundos / a.totalSessoes) : '0s',
      intentsList,
      principalAcao: intentsList.length > 0 ? intentsList[0] : null
    }
  }).sort((a, b) => b.totalSessoes - a.totalSessoes || b.tempoTotalSegundos - a.tempoTotalSegundos)

  // Série Temporal de Sessões (Agrupamento por Dia)
  const timelineMap = {}
  for (const s of sessoesTodas) {
    if (!s.dataInicio) continue
    const dateKey = formatarData(s.dataInicio, 'data')
    if (!timelineMap[dateKey]) {
      timelineMap[dateKey] = {
        data: dateKey,
        dataRaw: s.dataInicio,
        sessoes: 0,
        tempoTotalSegundos: 0,
        totalIntents: 0
      }
    }
    timelineMap[dateKey].sessoes += 1
    timelineMap[dateKey].tempoTotalSegundos += s.duracaoSegundos
    timelineMap[dateKey].totalIntents += s.totalIntents
  }

  const timelineSeries = Object.values(timelineMap).sort((a, b) => {
    return new Date(a.dataRaw).getTime() - new Date(b.dataRaw).getTime()
  })

  return {
    kpis: {
      totalSalas,
      totalSessoes,
      tempoTotalSegundos,
      tempoTotalFormatado: formatarDuracao(tempoTotalSegundos),
      tempoMedioSegundos,
      tempoMedioFormatado: formatarDuracao(tempoMedioSegundos),
      totalIntentsGeral,
      totalFacilitadores: facilitadoresList.length,
      totalAlunosCadastrados: alunosCadastrados.length,
      totalAlunosParticipantes,
      totalGrupos: grupos.length
    },
    intentsGlobaisList,
    facilitadoresList,
    alunosList,
    salas,
    grupos,
    sessoesTodas,
    timelineSeries
  }
}
