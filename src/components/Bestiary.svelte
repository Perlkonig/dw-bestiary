<script lang="ts">
    import {
        bestiary,
        existingCategories,
        existingNames,
    } from "@/stores/writeBestiary";
    import Card from "@/components/Card.svelte";
    import Modal from "./Modal.svelte";
    import MonsterElement from "@/components/Bestiary/Monster.svelte";
    import { afterUpdate } from "svelte";
    import type { DungeonWorldBestiary, Monster } from "@/schemas/bestiary";
    import type { Tab } from "@/custom.types";
    import { createEventDispatcher } from "svelte";
    import { toast } from "@zerodevx/svelte-toast";
    import stringify from "json-stringify-deterministic";

    const dispatch = createEventDispatcher<{ switch: { tab: Tab } }>();
    let catMap: { [k: string]: Monster[] } = {};
    let jsonDataStr: string;
    afterUpdate(() => {
        for (const cat of $existingCategories) {
            catMap[cat] = $bestiary.filter((m) => m.category === cat);
        }
        jsonDataStr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(stringify($bestiary));
    });

    let showModal = false;
    let savedJson: string;
    let overwrite = false;
    const handleLoad = () => {
        const loaded: DungeonWorldBestiary = JSON.parse(savedJson);
        if (!overwrite) {
            let count = 0;
            let skipped = 0;
            for (const mob of loaded) {
                if (!$existingNames.includes(mob.name)) {
                    $bestiary.push(JSON.parse(JSON.stringify(mob)));
                    count++;
                } else {
                    skipped++;
                }
            }
            $bestiary = $bestiary;
            toast.push(
                `Monsters added: ${count}, Duplicates skipped: ${skipped}`,
            );
        } else {
            $bestiary = loaded;
            toast.push("Bestiary fully replaced");
        }
        showModal = false;
    };
</script>

<div class="level">
    <div class="level-item">
        <a
            href="{jsonDataStr}"
            download="DWBestiaryBackup-{new Date().toISOString()}.json"
        >
            <button class="button apButton">Download Bestiary</button>
        </a>
    </div>
    <div class="level-item">
        <button class="button" on:click="{() => (showModal = true)}"
            >Load Bestiary</button
        >
    </div>
</div>

{#each $existingCategories as cat}
    <Card title="{cat}" icon="fa fa-book" expanded="{false}">
        {#if cat in catMap}
            {#each catMap[cat] as mob}
                <MonsterElement monster="{mob}" on:switch />
            {/each}
        {/if}
    </Card>
{/each}

<Modal
    title="Load JSON"
    show="{showModal}"
    buttons="{[
        {
            label: 'Load',
            style: 'is-success',
            callback: handleLoad,
        },
        {
            label: 'Close',
            callback: () => (showModal = false),
        },
    ]}"
>
    <div class="content">
        <p>
            By default, this will merge the imported bestiary with your existing
            one, ignoring duplicates. Check the box if you want to fully <em
                >replace</em
            > your existing bestiary. This cannot be undone!
        </p>
    </div>
    <div class="field">
        <label class="label" for="savedJSON">Paste saved JSON</label>
        <div class="control">
            <textarea class="textarea" id="savedJSON" bind:value="{savedJson}"
            ></textarea>
        </div>
    </div>
    <div class="field">
        <div class="control">
            <label class="checkbox">
                <input type="checkbox" bind:checked="{overwrite}" />
                Overwrite instead of merge?
            </label>
        </div>
    </div>
</Modal>
