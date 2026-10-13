import { ref, watch, onMounted, onUnmounted, toValue } from 'vue'

/**
 * Composable para recepção WebRTC de streaming de vídeo VR (HIMU / cyclops-dev.uab.cat)
 * usando a Estratégia B (PIN de 4 dígitos mapeado).
 *
 * @param {import('vue').Ref<string> | Function | string} roomIdSource - PIN de 4 dígitos da sala
 * @param {import('vue').Ref<HTMLVideoElement>} videoRef - Referência do elemento <video>
 * @param {string} [serverUrl] - URL do servidor de sinalização WebSocket
 */
export function useVRStream(roomIdSource, videoRef, serverUrl = 'wss://cyclops-dev.uab.cat/cast-wss/') {
  const isLive = ref(false)
  const isConnecting = ref(false)
  const statusTitle = ref('Vídeo não encontrado')
  const statusMessage = ref('Nenhuma transmissão detectada no momento')

  let pc = null
  let ws = null
  let pendingCandidates = []

  function cleanup() {
    if (pc) {
      try {
        pc.ontrack = null
        pc.onicecandidate = null
        pc.close()
      } catch (e) {}
      pc = null
    }

    if (videoRef?.value) {
      videoRef.value.srcObject = null
    }

    if (ws) {
      try {
        ws.onopen = null
        ws.onclose = null
        ws.onerror = null
        ws.onmessage = null
        ws.close()
      } catch (e) {}
      ws = null
    }

    isLive.value = false
    isConnecting.value = false
    pendingCandidates = []
  }

  async function conectar() {
    const rawPin = toValue(roomIdSource)
    const pin = rawPin ? String(rawPin).trim() : ''
    if (!pin) {
      statusTitle.value = 'Vídeo não encontrado'
      statusMessage.value = 'Nenhum PIN de transmissão associado à sala.'
      return
    }

    cleanup()
    isConnecting.value = true
    statusTitle.value = 'Conectando ao Servidor'
    statusMessage.value = 'Aguardando o óculos VR iniciar a transmissão...'

    try {
      const wsUrl = `${serverUrl}?type=browser&id=${encodeURIComponent(pin)}`
      ws = new WebSocket(wsUrl)
      ws.binaryType = 'arraybuffer'

      ws.onopen = () => {
        isConnecting.value = true
        statusTitle.value = 'Aguardando Óculos VR'
        statusMessage.value = `Conectado ao servidor. Aguardando transmissão no PIN ${pin}...`
      }

      ws.onmessage = async (event) => {
        try {
          const raw = event.data instanceof ArrayBuffer
            ? new TextDecoder().decode(event.data)
            : event.data

          const msg = JSON.parse(raw)

          // Unity encerrou a transmissão (type 2)
          if (msg.type === 2) {
            cleanup()
            statusTitle.value = 'Transmissão Encerrada'
            statusMessage.value = 'O óculos VR encerrou a transmissão.'
            return
          }

          // Oferta SDP vinda do Unity (type 3)
          if (msg.type === 3) {
            const sdpData = typeof msg.body === 'string' ? JSON.parse(msg.body) : msg.body

            pc = new RTCPeerConnection({
              iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
              ]
            })

            pc.ontrack = (trackEvent) => {
              const stream = (trackEvent.streams && trackEvent.streams[0])
                ? trackEvent.streams[0]
                : new MediaStream([trackEvent.track])

              if (videoRef?.value) {
                videoRef.value.srcObject = stream
                videoRef.value.play().catch(e => {
                  console.warn('[useVRStream] Autoplay bloqueado pelo navegador:', e)
                })
              }

              isLive.value = true
              isConnecting.value = false
              statusTitle.value = 'Ao Vivo'
              statusMessage.value = 'Transmissão ao vivo em andamento'
            }

            pc.onicecandidate = (candEvent) => {
              if (candEvent.candidate && ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 4,
                  body: JSON.stringify({
                    candidate: candEvent.candidate.candidate,
                    sdpMid: candEvent.candidate.sdpMid,
                    sdpMLineIndex: candEvent.candidate.sdpMLineIndex
                  })
                }))
              }
            }

            await pc.setRemoteDescription({ type: 'offer', sdp: sdpData.sdp })

            for (const cand of pendingCandidates) {
              await pc.addIceCandidate(cand).catch(console.warn)
            }
            pendingCandidates = []

            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)

            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 3,
                body: JSON.stringify({ type: 'answer', sdp: answer.sdp })
              }))
            }
          }

          // Candidato ICE vindo do Unity (type 4)
          else if (msg.type === 4) {
            const iceData = typeof msg.body === 'string' ? JSON.parse(msg.body) : msg.body
            const candidate = {
              candidate: iceData.candidate,
              sdpMid: iceData.sdpMid,
              sdpMLineIndex: iceData.sdpMLineIndex
            }

            if (!pc || !pc.remoteDescription) {
              pendingCandidates.push(candidate)
            } else {
              await pc.addIceCandidate(candidate).catch(console.warn)
            }
          }
        } catch (err) {
          console.error('[useVRStream] Erro ao processar mensagem signaling:', err)
        }
      }

      ws.onerror = (e) => {
        console.warn('[useVRStream] Erro no WebSocket de sinalização:', e)
        isConnecting.value = false
        statusTitle.value = 'Erro de Conexão'
        statusMessage.value = 'Não foi possível conectar ao servidor de sinalização.'
      }

      ws.onclose = () => {
        isConnecting.value = false
        isLive.value = false
        statusTitle.value = 'Vídeo não encontrado'
        statusMessage.value = 'Nenhuma transmissão detectada no momento'
      }

    } catch (error) {
      console.error('[useVRStream] Falha ao iniciar WebSocket:', error)
      isConnecting.value = false
      statusTitle.value = 'Falha na Conexão'
      statusMessage.value = 'Erro ao inicializar conexão com o servidor.'
    }
  }

  watch(() => toValue(roomIdSource), (novoPin) => {
    if (novoPin) {
      conectar()
    } else {
      cleanup()
    }
  })

  onMounted(() => {
    if (toValue(roomIdSource)) {
      conectar()
    }
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    isLive,
    isConnecting,
    statusTitle,
    statusMessage,
    conectar,
    cleanup
  }
}
