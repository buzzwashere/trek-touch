<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
</script>

<template>
  <div class="shell">
    <app-header />
    <main class="center">
      <router-view />
    </main>
    <app-footer />
  </div>
</template>

<style scoped>
/* North banner, routable center, south footer. The center takes whatever height is
   left and never scrolls the page itself, so a view can fill it exactly. */
.shell {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom)
    env(safe-area-inset-left);
}

.center {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
</style>
