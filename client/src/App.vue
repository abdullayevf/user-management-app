<template>
  <Toaster />
  <div class="w-full min-h-screen pt-40 bg-slate-900">
    <RouterView />
  </div>
</template>
<script setup>
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'
import { useAuthStore } from './stores/auth'
import { onBeforeMount } from 'vue'

const authStore = useAuthStore()

onBeforeMount(() => {
  authStore.initializeAuth()
})
</script>