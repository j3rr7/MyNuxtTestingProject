export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  
  return { message: `Get users for company by ID ${id} - to be implemented` };
})