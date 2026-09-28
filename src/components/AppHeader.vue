<script setup lang="ts">
const links = [
  { to: '/', label: 'Bridge' },
  { to: '/about', label: 'About' },
]
</script>

<template>
  <header class="banner">
    <span class="cap" aria-hidden="true"></span>
    <router-link to="/" class="brand">Trek Touch</router-link>
    <nav class="nav" aria-label="Main">
      <router-link
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="nav-link"
      >
        {{ link.label }}
      </router-link>
    </nav>
    <span class="cap cap-end" aria-hidden="true"></span>
  </header>
</template>

<style scoped>
.banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--lc-black);
  border-bottom: 2px solid #1a1a1a;
}

.cap {
  flex: 0 0 28px;
  height: var(--tap);
  border-radius: 24px 0 0 24px;
  background: var(--lc-orange);
}

.cap-end {
  border-radius: 0 24px 24px 0;
  background: var(--lc-periwinkle);
}

.brand {
  flex: 1;
  min-width: 0;
  font-size: clamp(1.4rem, 5vw, 2rem);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--lc-orange);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav {
  display: flex;
  gap: 6px;
}

.nav-link {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  min-width: 96px;
  min-height: var(--tap);
  padding: 0 12px 6px;
  background: var(--lc-lilac);
  color: var(--lc-black);
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-decoration: none;
  transition: filter 120ms;
}

.nav-link:active {
  filter: brightness(1.35);
}

.nav-link.router-link-exact-active {
  background: var(--lc-gold);
}

@media (max-width: 480px) {
  .nav-link {
    min-width: 72px;
  }
}
</style>
