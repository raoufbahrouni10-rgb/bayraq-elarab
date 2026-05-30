/** @type {import('@capacitor/cli').CapacitorConfig} */
const config = {
  appId: 'com.bayraq.elarab',
  appName: 'بيرق العرب',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#060d1a',
      showSpinner: true,
      spinnerColor: '#0e90e0',
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#060d1a',
    },
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
}

module.exports = config
