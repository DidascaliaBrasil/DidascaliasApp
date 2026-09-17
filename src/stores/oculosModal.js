import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useOculosModalStore = defineStore('oculosModal', () => {
  const isLinkarOpen = ref(false)
  const isGerenciarOpen = ref(false)

  const abrirLinkar = () => {
    isLinkarOpen.value = true
    isGerenciarOpen.value = false
  }

  const fecharLinkar = () => {
    isLinkarOpen.value = false
  }

  const abrirGerenciar = () => {
    isGerenciarOpen.value = true
    isLinkarOpen.value = false
  }

  const fecharGerenciar = () => {
    isGerenciarOpen.value = false
  }

  const fecharTodos = () => {
    isLinkarOpen.value = false
    isGerenciarOpen.value = false
  }

  return {
    isLinkarOpen,
    isGerenciarOpen,
    abrirLinkar,
    fecharLinkar,
    abrirGerenciar,
    fecharGerenciar,
    fecharTodos
  }
})
