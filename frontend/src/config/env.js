export const env = {
  apiBaseUrl:    import.meta.env.VITE_API_BASE_URL          || 'http://localhost:8082',
  wsBaseUrl:     import.meta.env.VITE_WS_BASE_URL           || 'ws://localhost:8082',
  googleMapsKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY   || '',
  mapsApiKey:    import.meta.env.VITE_GOOGLE_MAPS_API_KEY   || '',  // alias

  firebaseConfig: {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
    databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL,
  },
}