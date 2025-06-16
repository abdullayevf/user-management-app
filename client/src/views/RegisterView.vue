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
    name: z.string(),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password must not be empty')
}))

const { isFieldDirty, handleSubmit } = useForm({
    validationSchema: formSchema,
})

const onSubmit = handleSubmit(async (values) => {
    try {
        authStore.register(values.name, values.email, values.password)
        console.log('Register attempt with:', values)
    } catch (error) {
        toast.error('Register failed. Please try again.')
    }
})
</script>

<template>
    <Card class="mx-auto max-w-96">
        <CardHeader>
            <CardTitle>Register</CardTitle>
        </CardHeader>
        <CardContent>
            <form class="space-y-4" @submit="onSubmit">
                <FormField v-slot="{ componentField }" name="name">
                    <FormItem v-auto-animate>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input type="text" required placeholder="John Doe" v-bind="componentField" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                </FormField>
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
                <Button type="submit" class="w-full">
                    Register
                </Button>
                <p class="text-sm text-slate-400"> Already have an account? <RouterLink to="/login" class="transition-all hover:text-black ">Login</RouterLink> </p>
            </form>
        </CardContent>
    </Card>
    <Toaster />
</template>