export default defineNuxtRouteMiddleware(() => {
  if (process.env.NODE_ENV?.toString() !== 'development') {
    return abortNavigation()
  }
  return;
})