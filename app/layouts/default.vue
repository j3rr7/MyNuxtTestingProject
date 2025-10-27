<template>
  <div class="flex flex-col min-h-screen">
    <AppHeader />

    <main class="grow p-4">
      <UContainer>
        <slot />
      </UContainer>
    </main>

    <AppFooter />
  </div>
</template>
