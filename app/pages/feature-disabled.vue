<script setup lang="ts">
const router = useRouter()

definePageMeta({
  layout: 'blank'
})

const goHome = () => {
  router.push('/')
}

// Auto-redirect after 3 seconds
onMounted(() => {
  setTimeout(goHome, 3000)
})
</script>

<template>
  <div class="container">
    <h1>Feature Disabled</h1>
    <p>This feature is currently unavailable.</p>
    <p>You'll be redirected to the home page in a few seconds...</p>
    <button @click="goHome">Go to Home Now</button>
  </div>
</template>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

button {
  padding: 12px 24px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
  transition: background 0.3s;
}

button:hover {
  background: #4338ca;
}
</style>