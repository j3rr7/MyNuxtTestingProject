<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'

const props = defineProps({
  modelValue: { type: CalendarDate, default: null }
})

const emit = defineEmits(['update:modelValue'])

const df = new DateFormatter('en-US', { dateStyle: 'medium' })

const internalValue = ref<CalendarDate>();

watch(
  () => props.modelValue,
  (val) => internalValue.value = val
)

watch(
  () => internalValue.value,
  (val) => emit('update:modelValue', val)
)
</script>

<template>
  <UPopover>
    <UButton
      color="neutral"
      variant="subtle"
      icon="i-lucide-calendar"
      data-test="datepicker-button"
    >
      {{ internalValue ? df.format(internalValue.toDate(getLocalTimeZone())) : 'Select a date' }}
    </UButton>

    <template #content>
      <UCalendar v-model="internalValue" class="p-2" />
    </template>
  </UPopover>
</template>