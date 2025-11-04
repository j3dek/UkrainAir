<template>

    <div>
        <h3>Latests search:</h3>
        <ul v-if="history.length">
            <li
            v-for="(item, index) in history"
            :key="index"
            class="text-blue-600 cursor-pointer hover:underline"
            @click="emit('select', item)"
            >
                {{ item }}
            </li>
        </ul>
        <p v-else class="text-gray-500 text-sm">No previous searches</p>
        <button
        @click="clearHistory"
        class="mt-3 text-sm text-gray-500 hover:text-red-500 transition"
        >
            Clear history
        </button>
    </div>
</template>
<script setup>
import { ref, onMounted, watch, onUnmounted } from "vue";

const props = defineProps({
    modelValue: String, //zapytanie do rodzica
})

const emit = defineEmits(["update:modelValue","select","historyChanged"]);

const history = ref([])


function loadHistory() {
  try {
    const raw = localStorage.getItem("searchHistory");
    history.value = raw ? JSON.parse(raw) : [];
  } catch {
    history.value = [];
  }
}


onMounted(() => {
  loadHistory();
  window.addEventListener("storage", loadHistory);
});


onUnmounted(() => {
  window.removeEventListener("storage", loadHistory);
});


watch(
    () => props.modelValue,
    (newQuery) => {
        if(!newQuery || !newQuery.trim()) return;

        history.value = [newQuery, ...history.value.filter(q => q !== newQuery)];
        history.value = history.value.slice(0,10);

        localStorage.setItem("searchHistory",JSON.stringify(history.value));
        emit("historyChanged",history.value);
        
    }
);

function clearHistory() {
    history.value = []
    localStorage.removeItem("searchHistory")
    emit("historyChanged", [])
}
</script>

<style scoped>
ul {
  list-style: none;
  padding: 0;
}
</style>