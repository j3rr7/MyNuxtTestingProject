export default defineNuxtRouteMiddleware( async (to, _from) => {
  const { loggedIn, fetch: refreshSession } = useUserSession()
  
  await refreshSession()

  const publicRoutes = ['/login', '/error', '/qr']
  const isPublicRoute = publicRoutes.includes(to.path) || to.meta.auth === false
  
  if (loggedIn.value && to.path === '/login') {
    return navigateTo('/')
  }

  if (!isPublicRoute && !loggedIn.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})