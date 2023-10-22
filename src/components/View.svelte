<script lang="ts">
    import Monster from "./View/Monster.svelte";
    import type { Tab } from "@/custom.types";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher<{ switch: { tab: Tab } }>();
</script>

<Monster on:switch />
