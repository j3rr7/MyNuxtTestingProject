export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);

  console.log(url);
  
  // const session = await requireUserSession(event)
  // if (!session) {
  //   throw createError({
  //     statusCode: 401,
  //     statusMessage: 'Unauthorized',
  //   })
  // }
})