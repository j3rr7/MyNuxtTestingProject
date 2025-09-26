<script setup lang="ts">
  // get id from route params
  const route = useRoute();
  console.log("Ticket ID:", route.params.id);

  const { data: ticket } = await useFetch(`/api/tickets/${route.params.id}`, {
    lazy: true,
  });
</script>

<template>
  <div>{{ ticket ?? "..." }}</div>
</template>