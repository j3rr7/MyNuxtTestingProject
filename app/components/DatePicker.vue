<script setup lang="ts">
import {
  DateFormatter,
  getLocalTimeZone,
  type DateValue,
  type CalendarDate,
} from "@internationalized/date";

const df = new DateFormatter("en-US", {
  dateStyle: "medium",
});

const props = defineProps<{
  modelValue: CalendarDate | null;
  minDate?: DateValue;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: CalendarDate];
}>();

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    if (value) {
      emit("update:modelValue", value);
    }
  },
});

const formattedDate = computed(() => {
  if (props.modelValue) {
    return df.format(props.modelValue.toDate(getLocalTimeZone()));
  }
  return "Select a date";
});

function isDateDisabled(date: DateValue) {
  if (!props.minDate) {
    return false;
  }

  const min = props.minDate.toDate(getLocalTimeZone());
  min.setHours(0, 0, 0, 0);

  const d = date.toDate(getLocalTimeZone());
  d.setHours(0, 0, 0, 0);

  return d.getTime() < min.getTime();
}
</script>

<template>
  <UPopover>
    <UButton color="neutral" variant="subtle" icon="i-lucide-calendar">
      {{ formattedDate }}
    </UButton>

    <template #content>
      <UCalendar
        v-model="localValue"
        :is-date-disabled="isDateDisabled"
        class="p-2"
      />
    </template>
  </UPopover>
</template>
