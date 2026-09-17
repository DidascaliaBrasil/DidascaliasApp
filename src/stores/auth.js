import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth, database } from '../firebase'
import { ref as dbRef, get, query, orderByChild, equalTo } from 'firebase/database'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const isLoading = ref(false)

  const clearProfile = () => {
    user.value = null
    profile.value = null
  }

  const fetchProfile = async (authUser) => {
    if (!authUser) {
      clearProfile()
      return null
    }

    // Se já temos o perfil carregado para este usuário, retorna direto do cache
    if (profile.value && (profile.value.uid === authUser.uid || profile.value.authUid === authUser.uid)) {
      user.value = authUser
      return profile.value
    }

    isLoading.value = true
    user.value = authUser

    try {
      const shortId = authUser.uid.substring(0, 8).toUpperCase()
      const fullId = authUser.uid

      let dataEncontrada = null
      let idUsado = null
      let tipoConta = null

      // 1. Busca direta pelas chaves exatas (O(1) sem carregar listas inteiras)
      const paths = [
        { ref: `usuarios/${shortId}`, typeFallback: null },
        { ref: `usuarios/${fullId}`, typeFallback: null },
        { ref: `instituicoes/${shortId}`, typeFallback: 'Instituicao' },
        { ref: `instituicoes/${fullId}`, typeFallback: 'Instituicao' }
      ]

      for (const path of paths) {
        const snap = await get(dbRef(database, path.ref))
        if (snap.exists()) {
          dataEncontrada = snap.val()
          idUsado = path.ref.split('/')[1]
          tipoConta = dataEncontrada.tipoCadastro || dataEncontrada.tipo || path.typeFallback
          break
        }
      }

      // 2. Fallback indexado por E-mail (USA QUERY INDEXADA - JAMAIS BAIXA A RAIZ INTEIRA)
      if (!dataEncontrada && authUser.email) {
        const email = authUser.email
        const emailLower = email.toLowerCase()

        // 2a. Busca indexada em 'instituicoes' por email
        const qInst = query(dbRef(database, 'instituicoes'), orderByChild('email'), equalTo(email))
        let snapInst = await get(qInst)

        if (!snapInst.exists() && email !== emailLower) {
          snapInst = await get(query(dbRef(database, 'instituicoes'), orderByChild('email'), equalTo(emailLower)))
        }

        if (snapInst.exists()) {
          const data = snapInst.val()
          for (const key in data) {
            dataEncontrada = data[key]
            idUsado = key
            tipoConta = 'Instituicao'
            break
          }
        }

        // 2b. Busca indexada em 'usuarios' por email
        if (!dataEncontrada) {
          const qUsers = query(dbRef(database, 'usuarios'), orderByChild('email'), equalTo(email))
          let snapUsers = await get(qUsers)

          if (!snapUsers.exists() && email !== emailLower) {
            snapUsers = await get(query(dbRef(database, 'usuarios'), orderByChild('email'), equalTo(emailLower)))
          }

          if (snapUsers.exists()) {
            const data = snapUsers.val()
            for (const key in data) {
              dataEncontrada = data[key]
              idUsado = key
              tipoConta = data[key].tipoCadastro || data[key].tipo || 'Usuario'
              break
            }
          }
        }
      }

      if (dataEncontrada) {
        profile.value = {
          email: authUser.email,
          uid: authUser.uid,
          ...dataEncontrada,
          id: idUsado,
          tipo: tipoConta
        }
      } else {
        profile.value = {
          email: authUser.email,
          uid: authUser.uid,
          tipo: 'indefinido'
        }
      }

      return profile.value
    } catch (error) {
      console.error('[AuthStore] Erro ao carregar perfil do usuário:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const getUserProfile = async () => {
    if (profile.value) return profile.value
    const currentUser = auth.currentUser
    if (currentUser) {
      return await fetchProfile(currentUser)
    }
    return null
  }

  return {
    user,
    profile,
    isLoading,
    fetchProfile,
    getUserProfile,
    clearProfile
  }
})
