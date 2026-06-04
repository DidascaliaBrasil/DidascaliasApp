import { createRouter, createWebHashHistory } from 'vue-router'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import LoginView from '../views/LoginView.vue'
import CadastroView from '../views/CadastroView.vue'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true } // Apenas usuários NÃO logados podem acessar
    },
    {
      path: '/cadastro',
      name: 'cadastro',
      component: CadastroView,
      meta: { requiresGuest: true } // Apenas usuários NÃO logados podem acessar
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true } // Apenas usuários LOGADOS podem acessar
    }
  ]
})

// Função auxiliar para garantir o estado atual do usuário no Firebase
// Isso evita falsos negativos quando a página é atualizada (F5)
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      auth,
      (user) => {
        removeListener()
        resolve(user)
      },
      reject
    )
  })
}

// Guarda de navegação global antes de cada mudança de rota
router.beforeEach(async (to, from, next) => {
  const user = await getCurrentUser()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  if (requiresAuth && !user) {
    // Se a rota exige autenticação e o usuário não está logado, força ir para o Login
    next('/')
  } else if (requiresGuest && user) {
    // Se o usuário já está logado e tenta ir para Login/Cadastro, redireciona para a Home
    next('/home')
  } else {
    // Permite a navegação normalmente nas demais situações
    next()
  }
})

export default router