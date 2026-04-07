<template>
  <iframe
    :src="factorySrc"
    style="width:100%;height:100vh;border:none;display:block;"
    allow="clipboard-write"
  />
</template>

<script setup lang="ts">
const factorySrc = import.meta.env.DEV ? '/factory/index.html' : '/xc007/factory/index.html'
</script>
