<script setup lang="ts">
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const formSchema = toTypedSchema(z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password must not be empty')
}))

const { isFieldDirty, handleSubmit } = useForm({
    validationSchema: formSchema,
})

const onSubmit = handleSubmit(async (values) => {
    try {
        authStore.login(values.email, values.password)
        console.log('Login attempt with:', values)
        
    } catch (error) {
        toast.error('Login failed. Please try again.')
    }
})
</script>

<template>
    <Card class="mx-auto max-w-96">
        <CardHeader>
            <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
            <form class="space-y-4" @submit="onSubmit">
                <FormField v-slot="{ componentField }" name="email">
                    <FormItem v-auto-animate>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input type="email" required placeholder="example@email.com" v-bind="componentField" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                </FormField>
                <FormField v-slot="{ componentField }" name="password">
                    <FormItem v-auto-animate>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <Input type="password" required placeholder="••••••••" v-bind="componentField" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                </FormField>
                <Button :disabled="authStore.isLoading" type="submit" class="w-full">
                    <span v-if="authStore.isLoading">Loading...</span>
                    <span v-else>Sign In</span>
                </Button>
                <p class="text-sm text-slate-400"> You don't have an account? <RouterLink to="/register" class="transition-all hover:text-black "> Register</RouterLink> </p>
            </form>
        </CardContent>
    </Card>
    <Toaster />
</template>