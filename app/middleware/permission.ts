export default defineNuxtRouteMiddleware((to, from) => {
    const { hasAnyPermission, hasPermission, isAuthenticated } = useCurrentUser(); 

    if (!isAuthenticated.value) {
        return navigateTo('/auth/login');
    }

    const routePermissions: Record<string, string[]> = {
        "/companies": ["company:read"],
        "/tickets": ["ticket:read"],
        "/inquiries": ["inquiry:read"],
        "/billing": ["billing:read"],
        "/invoices": ["invoice:read"]
    }

    const requiredPermissions = routePermissions[to.path];

    if (requiredPermissions && !hasAnyPermission(requiredPermissions)) {
        return navigateTo("/error?type=forbidden")
    }
})