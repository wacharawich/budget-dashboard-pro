// Auth removed — this hook is no longer used.
export function useAuth() {
  return {
    isLoading: false,
    isAuthenticated: false,
    user: null,
    signIn: async (..._args: unknown[]) => {},
    signOut: async () => {},
  };
}
