import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    // automatically syncs zustand to local storage
    persist(
        (set) => ({
            token: null,
            login: (token) => set({ token }),
            logout: () => set({ token: null }),
        }),
        { name: 'unload-auth' } // key it is stored under
    )
);

export default useAuthStore;