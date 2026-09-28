<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <span class="seg seg-a" aria-hidden="true"></span>
    <p class="note">
      Trek Touch &middot; a fan-made LCARS study &middot; {{ year }}. Not affiliated with
      or endorsed by the owners of Star Trek.
    </p>
    <span class="seg seg-b" aria-hidden="true"></span>
  </footer>
</template>

<style scoped>
.footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-top: 2px solid #1a1a1a;
}

.seg {
  flex: 0 0 40px;
  height: 20px;
}

.seg-a {
  border-radius: 10px 0 0 10px;
  background: var(--lc-blue);
}

.seg-b {
  border-radius: 0 10px 10px 0;
  background: var(--lc-lilac);
}

.note {
  flex: 1;
  margin: 0;
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-align: center;
  color: var(--lc-dim);
}
</style>
