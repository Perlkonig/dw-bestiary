<script lang="ts">
    import Monster from "./View/Monster.svelte";
    import type { Tab } from "@/custom.types";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher<{ switch: { tab: Tab } }>();
</script>

<div class="content">
    <p>Click on an element to edit it.</p>
</div>
<Monster on:switch />
