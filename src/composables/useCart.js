// src/composables/useCatalog.ts
import { ref, computed, watch, onUnmounted } from 'vue'
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useRoom } from '@/stores/useRoom'

type Scope = 'restaurant' | 'personal'
type Group = { id: string; key: string; label: string; icon?: string; scope: Scope }
type Item = { id: string; label: string; scope: Scope; group: string }

export function useCatalog() {
  const room = useRoom()
  const groupsFS = ref<Group[]>([])
  const itemsFS = ref<Item[]>([])

  let unsubs: Array<() => void> = []
  onUnmounted(() => stopFS())

  function stopFS() {
    unsubs.forEach(fn => fn())
    unsubs = []
  }

  function watchCatalog() {
    stopFS()
    if (!room.space) return

    // 監聽群組
    const baseGroups = collection(db, 'rooms', room.space, 'groups')
    const un1 = onSnapshot(baseGroups, snap => {
      groupsFS.value = snap.docs.map(d => ({ id: d.id, ...d.data() } as Group))
    })
    unsubs.push(un1)

    // 監聽項目
    const baseItems = collection(db, 'rooms', room.space, 'items')
    const un2 = onSnapshot(baseItems, snap => {
      itemsFS.value = snap.docs.map(d => ({ id: d.id, ...d.data() } as Item))
    })
    unsubs.push(un2)
  }

  watch(() => room.space, () => watchCatalog(), { immediate: true })

  const availableGroups = computed<Group[]>(() => {
    return groupsFS.value.filter(g => g.scope === room.scope)
  })

  const availableItems = computed<Item[]>(() => {
    if (!room.group) return []
    return itemsFS.value.filter(it => it.group === room.group)
  })

  async function addItem(name: string) {
    const label = (name || '').trim()
    if (!room.space) throw new Error('請先連線')
    if (!room.group) throw new Error('請先選類別')
    if (!label) throw new Error('輸入項目名稱')

    const base = collection(db, 'rooms', room.space, 'items')
    await addDoc(base, {
      scope: room.scope,
      group: room.group,
      label,
      ts: serverTimestamp(),
    })
  }

  return { watchCatalog, availableGroups, availableItems, addItem }
}
