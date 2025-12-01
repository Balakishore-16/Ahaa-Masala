
// This utility automatically detects your network IP to allow cross-device sync.
// It assumes the backend server is running on Port 5000 of the same machine serving the frontend.

const getBaseUrl = () => {
    try {
        // If running in a browser
        if (typeof window !== 'undefined') {
            const { hostname } = window.location;
            // If we are on localhost, it returns 'localhost'
            // If we are on a network IP (e.g., 192.168.1.5), it returns that IP
            return `http://${hostname}:5000/api`;
        }
    } catch (e) {
        console.error("Error detecting API URL", e);
    }
    // Fallback default
    return 'http://localhost:5000/api';
};

const API_URL = getBaseUrl();

export const api = {
    /**
     * Load data: Tries LocalStorage first (instant), then background fetches from Server.
     * Use 'onServerData' callback to update state when server data arrives.
     */
    load: async <T>(key: string, defaultValue: T, onServerData?: (data: T) => void): Promise<T> => {
        // 1. Get Local Data (Instant)
        let localData = defaultValue;
        try {
            const s = localStorage.getItem(key);
            if (s) localData = JSON.parse(s);
        } catch (e) {
            console.error(`Error loading local ${key}`, e);
        }

        // 2. Fetch Server Data (Background)
        if (onServerData) {
            fetch(`${API_URL}/data/${key}`)
                .then(res => {
                    if (!res.ok) throw new Error('Server offline');
                    return res.json();
                })
                .then(serverData => {
                    if (serverData !== null) {
                        // PROTECTION LOGIC: 
                        // If server sends empty data (likely fresh install) but we have local data,
                        // DO NOT overwrite local. Instead, push local data to server to sync it up.
                        const serverIsEmpty = Array.isArray(serverData) && serverData.length === 0;
                        const localHasData = Array.isArray(localData) && localData.length > 0;
                        
                        // Special case for 'products' - if server has 0 but local has > 0, trust local.
                        if (key === 'products' && serverIsEmpty && localHasData) {
                            console.log(`Server has no ${key}, syncing local data to server...`);
                            api.save(key, localData);
                            return; 
                        }

                        // Compare simplified JSON strings to avoid unnecessary updates
                        if (JSON.stringify(localData) !== JSON.stringify(serverData)) {
                            // console.log(`Synced ${key} from server`);
                            localStorage.setItem(key, JSON.stringify(serverData)); // Update local cache
                            onServerData(serverData);
                        }
                    }
                })
                .catch(err => {
                    // Silent fail - server might be down, just use local
                    // console.log(`Server sync failed for ${key}: Using local mode.`);
                });
        }

        return localData;
    },

    /**
     * Save data: Updates LocalStorage immediately AND pushes to Server.
     */
    save: async <T>(key: string, data: T) => {
        // 1. Save Local (Instant)
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Error saving local ${key}`, e);
        }

        // 2. Push to Server (Fire and Forget)
        try {
            await fetch(`${API_URL}/data/${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch (e) {
            console.warn(`Could not sync ${key} to server. Is node server.js running?`);
        }
    }
};
