export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);

  if (url.pathname.startsWith("/api/")) {
    // Only on api routes
    
  }
  
  // const session = await requireUserSession(event)
  // if (!session) {
  //   throw createError({
  //     statusCode: 401,
  //     statusMessage: 'Unauthorized',
  //   })
  // }
})