interface User {
    username: string;
    permissions: string[];
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
}

export const useCurrentUser = () => {
    const authState = ref<AuthState>({
        user: null,
        isAuthenticated: false
    });

    const login = (username: string, password: string): boolean => {
        // Hardcoded
        if (username === 'admin' && password === 'admin') {
            const user = {
                username: "admin",
                permissions: [
                    "company:*",
                    "ticket:*",
                    "inquiry:*",
                    "billing:*",
                    "invoice:*"
                ]
            }

            authState.value = {
                user,
                isAuthenticated: true
            }

            // Store to storage
            
            return true;
        }

        return false;
    }

    const logout = (): void => {
        authState.value = {
            user: null,
            isAuthenticated: false
        }
    }

    const hasPermission = (permission: string): boolean => {
        return authState.value.user?.permissions.includes(permission) || false;
    }

    const hasAnyPermission = (permissions: string[]): boolean => {
        return permissions.some((permission) => hasPermission(permission));
    }

    const initializeAuth = (): void => {
        // TODO
    }

    return {
        user: readonly(computed(() => authState.value.user)),
        isAuthenticated: readonly(computed(() => authState.value.isAuthenticated)),
        login,
        logout,
        hasPermission,
        hasAnyPermission,
        initializeAuth
    }
}