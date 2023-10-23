<script lang="ts">
    import type { Monster } from "@/schemas/bestiary";
    import SvelteMarkdown from "svelte-markdown";
    import Moves from "@/components/Moves.svelte";
    import Card from "@/components/Card.svelte";
    import Modal from "@/components/Modal.svelte";
    import type { Tab } from "@/custom.types";
    import { afterUpdate, createEventDispatcher } from "svelte";
    import { currMonster } from "@/stores/writeMonster";
    import { bestiary, existingCategories } from "@/stores/writeBestiary";
    import { toast } from "@zerodevx/svelte-toast";
    import stringify from "json-stringify-deterministic";

    const dispatch = createEventDispatcher<{ switch: { tab: Tab } }>();
    export let monster: Monster;
    let showModal = false;
    let showDelModal = false;
    let showSaveModal = false;
    let saveCategory = "";
    let newSaveCategory = "";

    const handleLoad = () => {
        $currMonster = JSON.parse(JSON.stringify(monster));
        dispatch("switch", { tab: "view" });
        toast.push("Monster loaded. Ready for editing.");
    };

    const handleDelete = () => {
        bestiary.set($bestiary.filter((m) => m.name !== monster.name));
        $bestiary = $bestiary;
        showDelModal = false;
        toast.push(`Monster "${monster.name}" deleted from the bestiary!`);
    };

    const handleCategoryChange = () => {
        let cat = saveCategory;
        if (cat === "_new") {
            cat = newSaveCategory;
        }
        if (!cat.match(/^_/) && !cat.match(/\s/)) {
            monster.category = cat;
            monster = monster;
            const rest = $bestiary.filter((m) => m.name !== monster.name);
            bestiary.set([...rest, JSON.parse(JSON.stringify(monster))]);
            toast.push(`Monster "${monster.name}" moved to "${cat}"`);
        } else {
            toast.push(
                `Category names may not start with an underscore or contain any spaces.`,
            );
        }
        showSaveModal = false;
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(stringify(monster));
            toast.push(`Monster "${monster.name}" copied to clipboard`);
        } catch (err) {
            toast.push(`Failed to copy: ${err}`);
        }
    };

    let htmlExport: string;
    let eleMarkdown: HTMLDivElement;
    afterUpdate(() => {
        const html = `
            <html>
                <head>
                    <meta charset='utf-8'>
                    <title>HTML Export of Monster "${monster.name}"</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <style>
                        .tags {
                            font-style: italic;
                        }
                    </style>
                </head>
                <body>
                    <img src="${monster.media}" alt="${monster.name}">
                    <p>
                        <b>${monster.name}</b> (<span class="tags">${monster.tags.general.join(", ")}</span>)
                    </p>
                    <p>
                        ${monster.attack.name} (${monster.attack.damage})<br><span class="tags">${monster.tags.combat.join(", ")}</span>
                    </p>
                    <p>
                        ${monster.hp} HP&emsp;${monster.armor} Armor
                    </p>
                    <p>
                        <b>Special qualities:</b> <span class="tags">${monster.tags.special.join(", ")}</span>
                    </p>
                    <div>
                        ${eleMarkdown !== undefined ? eleMarkdown.outerHTML : ""}
                    </div>
                </body>
            </html>
        `;
        htmlExport = html; // 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
    });

    const copyHTMLtoClipboard = async () => {
        try {
            const item: ClipboardItem = new ClipboardItem({
                "text/plain": new Blob([stringify(monster)], {type: "text/plain"}),
                "text/html": new Blob([htmlExport], {type: "text/html"}),
            });
            await navigator.clipboard.write([item]);
            toast.push(`HTML version of monster "${monster.name}" copied to clipboard`);
        } catch (err) {
            toast.push(`Failed to copy: ${err}`);
        }
    };

</script>

<Card  title="{monster.name}" expanded="{false}">
    <div class="media">
        <div class="media-left" on:click="{() => (showModal = true)}">
            <figure>
                <p class="image is-square">
                    <img src="{monster.media}" alt="{monster.name}" />
                </p>
            </figure>
            <br />
        </div>
        <div class="modal{showModal ? ' is-active' : ''}">
            <div
                class="modal-background"
                on:click="{() => (showModal = false)}"
            ></div>
            <div class="modal-content">
                <p class="image is-square">
                    <img src="{monster.media}" alt="{monster.name}" />
                </p>
            </div>
            <button
                class="modal-close is-large"
                aria-label="close"
                on:click="{() => (showModal = false)}"
            ></button>
        </div>
        <div class="media-content">
            <div class="columns">
                <div class="column is-narrow">
                    <div class="content">
                        <p><b>{monster.name}</b></p>
                    </div>
                </div>
                <div class="column" style="padding-left: 1rem">
                    <div class="content">
                        <p>
                            {#each monster.tags.general as tag}
                                <span class="tag">{tag}</span>&ensp;
                            {/each}
                        </p>
                    </div>
                </div>
            </div>
            <!-- attack, hp, armor -->
            <div class="columns">
                <div class="column" style="padding-right: 2em;">
                    <div class="content">
                        <p>
                            <span>
                                {monster.attack?.name}
                            </span>
                            <span>
                                {monster.attack.damage}
                            </span>
                            <br />
                            <span>
                                {#each monster.tags.combat as tag}
                                    <span class="tag">{tag}</span>&ensp;
                                {/each}
                            </span>
                        </p>
                    </div>
                </div>
                <div class="column is-narrow" style="padding-right: 2rem;">
                    <div class="content">
                        {monster.hp} HP
                    </div>
                </div>
                <div class="column is-narrow">
                    <div class="content">
                        {monster.armor} Armor
                    </div>
                </div>
            </div>
            <div class="columns">
                <div class="column">
                    <div class="content">
                        <p>
                            <b>Special qualities:&ensp;</b>
                            {#each monster.tags.special as tag}
                                <span class="tag">{tag}</span>&ensp;
                            {/each}
                        </p>
                    </div>
                </div>
            </div>
            <div class="columns">
                <div class="column">
                    <div class="content" bind:this="{eleMarkdown}">
                        <p>
                            <b>Instinct: </b><i>{monster.instinct}</i>
                        </p>
                    {#if monster.moves !== undefined && monster.moves.length > 0}
                        <Moves moves="{monster.moves}" />
                    {:else}
                        <p><i>No special moves.</i></p>
                    {/if}
                    {#if monster.description !== undefined}
                        <hr />
                        <SvelteMarkdown source="{monster.description}" />
                    {/if}
                    </div>
                </div>
            </div>
        </div>
    </div>
    <footer class="card-footer">
        <a href="#" class="card-footer-item" on:click="{copyToClipboard}"
            >Copy JSON</a
        >
        <a href="#" class="card-footer-item" on:click="{copyHTMLtoClipboard}"
            >Copy HTML</a
        >
        <a
            href="#"
            class="card-footer-item"
            on:click="{() => (showSaveModal = true)}">Move</a
        >
        <a href="#" class="card-footer-item" on:click="{handleLoad}">Edit</a>
        <a
            href="#"
            class="card-footer-item"
            on:click="{() => (showDelModal = true)}">Delete</a
        >
    </footer>
</Card>

<Modal
    title="Delete Creature?"
    show="{showDelModal}"
    buttons="{[
        {
            label: 'Delete',
            style: 'apButtonAlert',
            callback: handleDelete,
        },
        {
            label: 'Close',
            callback: () => (showDelModal = false),
            style: 'apButton',
        },
    ]}"
>
    <div class="content">
        <p>
            Are you sure you want to delete this creature? This cannot be
            undone!
        </p>
    </div>
</Modal>

<Modal
    title="Change Category"
    show="{showSaveModal}"
    buttons="{[
        {
            label: 'Close',
            callback: () => (showSaveModal = false),
        },
    ]}"
>
    <div class="field">
        <label class="label" for="categorySelect">Select a category</label>
        <div class="control">
            <div class="select">
                <select id="categorySelect" bind:value="{saveCategory}">
                    <option value=""></option>
                    <option value="_new">--Create a new category--</option>
                    {#each $existingCategories as cat}
                        <option value="{cat}">{cat}</option>
                    {/each}
                </select>
            </div>
        </div>
    </div>
    {#if saveCategory === "_new"}
        <div class="field">
            <label class="label" for="categoryName">Name the new category</label
            >
            <div class="control">
                <input
                    class="input"
                    type="text"
                    id="categoryName"
                    bind:value="{newSaveCategory}"
                />
            </div>
            <p class="help">
                May not start with an underscore, and may not contain any
                spaces.
            </p>
        </div>
        {#if newSaveCategory.length > 0 && !newSaveCategory.match(/^_/) && !newSaveCategory.match(/\s/)}
            <div class="control">
                <button
                    class="button apButton"
                    on:click="{handleCategoryChange}">Move</button
                >
            </div>
        {/if}
    {:else if saveCategory.length > 0}
        <div class="control">
            <button class="button apButton" on:click="{handleCategoryChange}"
                >Move</button
            >
        </div>
    {/if}
</Modal>

<style>
    .media-left {
        width: 25%;
        padding-right: 1rem;
    }
    .columns {
        padding-bottom: 0.75rem;
    }
    .column {
        padding: 0;
    }
</style>
