export const valueUpdater = (updaterOrValue: any, ref: any) => {
  ref.value = typeof updaterOrValue === 'function' ? updaterOrValue(ref.value) : updaterOrValue
} 