<script setup lang="ts">
import { ref, onBeforeMount, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Lock, LockOpen, Trash2, LogOut } from 'lucide-vue-next';
import axios from 'axios'
import { toast } from "vue-sonner"


interface User {
    id: number
    name: string
    email: string
    lastLogin: Date
    blocked: boolean
    createdAt: Date
}

const users = ref<User[]>([])
const selectedUserIds = ref(new Set<number>())
const isLoading = ref(true)
const error = ref<string | null>(null)

const authStore = useAuthStore()
const currentUser = computed(() => authStore.user)

onBeforeMount(async () => {
    try {
        users.value = await authStore.fetchUsers()
    } catch (error: any) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to fetch users'
        error.value = errorMessage
        toast.error(errorMessage)
    } finally {
        isLoading.value = false
    }
})

// Check if current user is blocked
const isCurrentUserBlocked = computed(() => {
    const currentUserInList = users.value.find(user => user.id === currentUser.value?.id)
    return currentUserInList?.blocked || false
})

// HEADER "Select All" computed
const selectAll = computed<boolean>({
    get: () =>
        users.value.length > 0 &&
        selectedUserIds.value.size === users.value.length,
    set: (val) => {
        selectedUserIds.value = val
            ? new Set(users.value.map((u) => u.id))
            : new Set()
    },
})

// indeterminate state for header checkbox
const indeterminate = computed<boolean>(
    () =>
        selectedUserIds.value.size > 0 &&
        selectedUserIds.value.size < users.value.length
)

// manual row handler
function handleRowCheck(id: number, checked: boolean | "indeterminate") {
    if (typeof checked === "boolean") {
        const next = new Set(selectedUserIds.value)
        checked ? next.add(id) : next.delete(id)
        selectedUserIds.value = next
    }
}

const formatTimeDifference = (lastLogin: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(lastLogin).getTime()
    
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return `${seconds}s ago`
}

async function bulkAction(action: 'block' | 'unblock' | 'delete') {
    if (action === 'delete') {
        try {
            const response = await axios.delete(`http://localhost:3000/api/users/${action}`, {
                data: { userIds: Array.from(selectedUserIds.value) }
            })

            const { message } = response.data
            users.value = users.value.filter(user => !selectedUserIds.value.has(user.id))
            selectedUserIds.value.clear()
            toast.success(message || 'Users deleted successfully')
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to delete users'
            toast.error(errorMessage)
            console.error(error)
        }
    } else {
        try {
            const response = await axios.post(`http://localhost:3000/api/users/${action}`, {
                userIds: Array.from(selectedUserIds.value)
            })

            const { message } = response.data
            users.value = users.value.map(user =>
                selectedUserIds.value.has(user.id)
                    ? { ...user, blocked: action === 'block' }
                    : user
            )
            selectedUserIds.value.clear()
            toast.success(message || `${action === 'block' ? 'Blocked' : 'Unblocked'} users successfully`)
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || `Failed to ${action} users`
            toast.error(errorMessage)
            console.error(error)
        }
    }
}
</script>

<template>
    <div class="p-4">
        <div v-if="isLoading" class="text-center py-4 text-white">Loading…</div>
        <div v-else-if="error" class="text-center py-4 text-red-500">{{ error }}</div>
        <div v-else>
            <div class="flex gap-2 items-center mb-4">
                <Button 
                    :disabled="selectedUserIds.size === 0" 
                    class="cursor-pointer"
                    @click="bulkAction('block')"
                    title="Block selected users">
                    <span>Block</span>
                    <Lock :size="20" class="ml-2" />
                </Button>
                <Button 
                    :disabled="selectedUserIds.size === 0" 
                    variant="outline" 
                    class="cursor-pointer"
                    @click="bulkAction('unblock')"
                    title="Unblock selected users">
                    <LockOpen :size="20" />
                </Button>
                <Button 
                    :disabled="selectedUserIds.size === 0" 
                    variant="destructive" 
                    class="cursor-pointer"
                    @click="bulkAction('delete')"
                    title="Delete selected users">
                    <Trash2 :size="20" />
                </Button>
                <Button 
                    class="cursor-pointer ml-auto"
                    @click="authStore.logout()"
                    title="Logout">
                    <LogOut :size="20" />
                </Button>
            </div>

            <Table class="bg-white rounded overflow-x-auto">
                <TableCaption>User Management</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead class="w-[50px]">
                            <Checkbox 
                                v-model:modelValue="selectAll" 
                                :indeterminate.prop="indeterminate"
                                aria-label="Select all users" />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead class="text-right">Last login</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    <TableRow v-for="user in users" :key="user.id">
                        <TableCell>
                            <Checkbox 
                                :model-value="selectedUserIds.has(user.id)"
                                @update:modelValue="val => handleRowCheck(user.id, val)" 
                                aria-label="Select user" />
                        </TableCell>
                        <TableCell class="font-medium">{{ user.name }}</TableCell>
                        <TableCell>{{ user.email }}</TableCell>
                        <TableCell>{{ user.blocked ? 'Blocked' : 'Active' }}</TableCell>
                        <TableCell class="text-right">{{ formatTimeDifference(user.lastLogin) }}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    </div>
</template>

<style scoped>
.table-container {
    width: 100%;
    overflow-x: auto;
}

/* Ensure proper text alignment in cells */
:deep(td), :deep(th) {
    text-align: left;
    padding: 0.75rem;
}

:deep(td:last-child), :deep(th:last-child) {
    text-align: right;
}
</style>