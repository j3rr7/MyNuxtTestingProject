// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      title: 'Saleswatch Admin Tools',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { charset: 'utf-8' },
        { name: 'description', content: 'Saleswatch Admin Tools' }
      ],
      link: [
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },

  auth: {
    webAuthn: true
  },

  css: ['animate.css', '~/assets/css/main.css', 'animate.css/animate.min.css'],
  ui: {
    theme: {
      colors: [
        'primary', 
        'secondary', 
        'success', 
        'info', 
        'warning', 
        'error',
        'green', 
        'red', 
        'yellow',
        'neutral'
      ],
    }
  },

  nitro: {
    experimental: {
      websocket: true
    }
  },

  runtimeConfig: {
    /**
     * Key here available server side 
     */
    databaseUrl: "postgresql://postgres:postgres@server.local:5432/testdb2",
    secretKey: "KNJVGLKJKQQECZDNNFXGS43UOJQXI33S",
    session: {
      password: "cface596bb444ba385402305b05d710f"
    },
    public: {
      /**
       * Key here available client side 
       */  
    }
  },

  modules: [
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/ui',
    '@nuxt/eslint',
    'nuxt-qrcode',
    'nuxt-auth-utils'
  ]
})