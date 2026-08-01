import userAuthStore from '../store/authStore';

export async function authFetch(url, options = {}) {
    const response = await fetch(url, options);
    if (response.status === 401) {
        userAuthStore.getState().logout();
        throw new Error('SESSION_EXPIRED');
    }
    return response;
}