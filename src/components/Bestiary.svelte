<script lang="ts">
    import { bestiary, existingCategories } from "@/stores/writeBestiary";
    import Card from "@/components/Card.svelte";
    import MonsterElement from "@/components/Bestiary/Monster.svelte";
    import { afterUpdate } from "svelte";
    import type { Monster } from "@/schemas/bestiary";
    import type { Tab } from "@/custom.types";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher<{ switch: { tab: Tab } }>();
    let catMap: { [k: string]: Monster[] } = {};
    afterUpdate(() => {
        for (const cat of $existingCategories) {
            catMap[cat] = $bestiary.filter((m) => m.category === cat);
        }
    });
</script>

{#each $existingCategories as cat}
    <Card title="{cat}" icon="fa fa-book" expanded="{false}">
        {#if cat in catMap}
            {#each catMap[cat] as mob}
                <MonsterElement monster="{mob}" on:switch />
            {/each}
        {/if}
    </Card>
{/each}
