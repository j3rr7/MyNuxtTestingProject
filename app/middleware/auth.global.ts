export default defineNuxtRouteMiddleware((to, _from) => {
  const { loggedIn } = useUserSession()
  
  const publicRoutes = ['/login', '/error', '/qr']
  
  // Check if route has auth: false in page meta
  const isPublicRoute = publicRoutes.includes(to.path) || to.meta.auth === false
  
  if (!isPublicRoute && !loggedIn.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})