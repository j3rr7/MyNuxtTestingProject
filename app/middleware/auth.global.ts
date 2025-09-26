export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, initializeAuth } = useCurrentUser()
  
  initializeAuth()
  
  const publicRoutes = ['/login', '/error']
  
  // Check if route has auth: false in page meta
  const isPublicRoute = publicRoutes.includes(to.path) || to.meta.auth === false
  
  if (!isPublicRoute && !isAuthenticated.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})