export default defineEventHandler(async (event) => {
  // Only apply to API routes
  if (!event.node.req.url?.startsWith('/api/')) {
    return
  }
  
  // Skip auth endpoints
  if (event.node.req.url === '/api/auth/login' || event.node.req.url === '/api/auth/logout') {
    return
  }
  
  try {
    // Get session data from headers or cookies
    // const authHeader = getHeader(event, 'authorization')
    // const sessionCookie = getCookie(event, 'auth-session')
    
    // let user = null
    
    // if (authHeader && authHeader.startsWith('Bearer ')) {
    //   // In a real app, you'd validate the JWT token
    //   const token = authHeader.substring(7)
    //   if (token === 'demo-token') {
    //     user = getUserFromSession({ user: { username: 'testUser' } })
    //   }
    // } else if (sessionCookie) {
    //   try {
    //     const sessionData = JSON.parse(sessionCookie)
    //     user = getUserFromSession(sessionData)
    //   } catch (error) {
    //     console.error('Failed to parse session cookie:', error)
    //   }
    // }
    
    // Store user in event context for use in API handlers
    // event.context.user = user
    
  } catch (error) {
    console.error('Auth middleware error:', error)
    event.context.user = null
  }
})