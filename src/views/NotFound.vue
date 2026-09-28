<template>
  <div class="lost">
    <p class="code">Error 404</p>
    <h1>Sector not charted</h1>
    <p>Astrometrics has no record of this location.</p>
    <router-link
      to="/"
      class="home"
    >
      Return to Bridge
    </router-link>
  </div>
</template>

<style scoped>
.lost {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
  padding: 24px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.code {
  margin: 0;
  color: var(--lc-dim);
}

h1 {
  margin: 0;
  color: var(--lc-orange);
  font-size: 2.2rem;
}

.home {
  display: inline-flex;
  align-items: center;
  min-height: var(--tap);
  margin-top: 16px;
  padding: 0 28px;
  border-radius: 24px;
  background: var(--lc-periwinkle);
  color: var(--lc-black);
  font-weight: 700;
  text-decoration: none;
}
</style>
