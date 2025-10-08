import { defineStore } from "pinia";

export type ModalType = "view" | "extend" | "disable" | "delete" | null;

export interface ModalPayload {
    [key: string]: unknown
}

export const useModalStore = defineStore("modal", () => {
  const isOpen = ref(false);
  const modalType = ref<ModalType>(null);
  const payload = ref<ModalPayload | null>(null);

  function open(type: ModalType, data?: ModalPayload) {
    modalType.value = type;
    payload.value = data || null;
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
    modalType.value = null;
    payload.value = null;
  }

  return { isOpen, modalType, payload, open, close };
});