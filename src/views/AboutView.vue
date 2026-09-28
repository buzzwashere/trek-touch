<template>
  <article class="about">
    <h1>About Trek Touch</h1>
    <p>
      A touch-first study of LCARS, the Library Computer Access and Retrieval System seen on
      starship consoles in Star Trek: Voyager. Everything on the Bridge is built from plain
      HTML and CSS: the elbows are rounded boxes, the concave corners are radial gradients,
      and the sounds are synthesised on the fly.
    </p>
    <h2>Touch controls</h2>
    <ul>
      <li><strong>Tap</strong> a department on the left rail to filter the ribbons.</li>
      <li><strong>Tap</strong> a ribbon to expand its full report and live data cascade.</li>
      <li><strong>Swipe right</strong> on a ribbon to acknowledge it; swipe again to restore.</li>
      <li><strong>Red Alert</strong> and <strong>Audio</strong> live at the foot of the rail.</li>
    </ul>
    <p class="fine">
      Every status report is invented. Any resemblance to actual starship malfunctions is
      entirely coincidental.
    </p>
  </article>
</template>

<style scoped>
.about {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 20px 40px;
  color: var(--lc-text);
  font-size: 1.15rem;
  line-height: 1.5;
  letter-spacing: 0.02em;
}

h1 {
  margin: 0 0 12px;
  color: var(--lc-orange);
  font-size: 2.2rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

h2 {
  margin: 28px 0 8px;
  color: var(--lc-periwinkle);
  font-size: 1.4rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

ul {
  padding-left: 20px;
}

li {
  margin-bottom: 6px;
}

strong {
  color: var(--lc-gold);
}

.fine {
  margin-top: 28px;
  color: var(--lc-dim);
  font-size: 0.95rem;
}
</style>
