export default defineNuxtRouteMiddleware(async (to, _from) => {
  if (to.meta?.featureFlagEnabled === undefined) {
    // No feature flag meta property, proceed normally
    return
  }

  if (to.meta.featureFlagEnabled === false) {
    // Redirect to error page when feature flag is disabled
    return navigateTo('/feature-disabled')
  }

  // Feature flag is enabled, proceed normally
  return
})