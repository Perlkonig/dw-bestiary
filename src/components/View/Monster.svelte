<script lang="ts">
    import {
        blankMonster,
        currCategory,
        currMonster as monster,
    } from "@/stores/writeMonster";
    import SvelteMarkdown from "svelte-markdown";
    import Moves from "@/components/Moves.svelte";
    import Card from "@/components/Card.svelte";
    import Modal from "@/components/Modal.svelte";
    import {
        bestiary,
        existingCategories,
        existingNames,
    } from "@/stores/writeBestiary";
    import stringify from "json-stringify-deterministic";
    import { lastGen } from "@/stores/writeLastGen";
    import type { Tab } from "@/custom.types";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher<{ switch: { tab: Tab } }>();
    export let expandable = false;
    let showModal = false;
    let showSaveModal = false;
    let saveCategory = "";
    let newSaveCategory = "";

    type Field =
        | "name"
        | "description"
        | "media"
        | "tagsGeneral"
        | "tagsSpecial"
        | "atk"
        | "hp"
        | "armor"
        | "instinct"
        | "moves";
    let editMode: Field | undefined = undefined;

    const normalizeTags = (csl: string): string[] => {
        // strip newlines
        csl = csl.replace(/\n/g, "");
        // strip double spaces
        csl = csl.replace(/  /g, " ");
        // strip spaces around commas
        csl = csl.replace(/\s*,\s*/g, ",");
        // strip double commas
        csl = csl.replace(/,{2,}/, ",");
        // strip trailing commas
        csl = csl.replace(/,+$/, "");
        // strip leading commas
        csl = csl.replace(/^,+/, "");
        // strip leading whitespace
        csl = csl.replace(/^\s+/, "");
        // strip trailing whitespace
        csl = csl.replace(/\s+$/, "");
        const split = csl.split(",");
        if (split.length === 1 && split[0] === "") {
            return [];
        } else {
            return split;
        }
    };

    let tagsGeneralFlat: string;
    $: if (editMode !== "tagsGeneral") {
        tagsGeneralFlat = $monster.tags.general.join(", ");
    }
    const handleGeneralTagChange = () => {
        $monster.tags.general = normalizeTags(tagsGeneralFlat);
        editMode = undefined;
    };

    let tagsCombatFlat: string;
    $: if (editMode !== "atk") {
        tagsCombatFlat = $monster.tags.combat.join(", ");
    }
    const handleCombatTagChange = () => {
        $monster.tags.combat = normalizeTags(tagsCombatFlat);
        editMode = undefined;
    };

    let tagsSpecialFlat: string;
    $: if (editMode !== "tagsSpecial") {
        tagsSpecialFlat = $monster.tags.special.join(", ");
    }
    const handleSpecialTagChange = () => {
        $monster.tags.special = normalizeTags(tagsSpecialFlat);
        editMode = undefined;
    };

    let movesFlat: string;
    $: if (editMode !== "moves") {
        movesFlat = $monster.moves?.join("\n\n") || "";
    }
    const handleMoveChange = () => {
        // strip double newlines
        movesFlat = movesFlat.replace(/\n\n/g, "\n");
        // strip double spaces
        movesFlat = movesFlat.replace(/  /g, " ");
        // strip spaces around newlines
        movesFlat = movesFlat.replace(/\s*\n\s*/g, "\n");
        // strip leading newlines
        movesFlat = movesFlat.replace(/^\n+/, "");
        // strip trailing newlines
        movesFlat = movesFlat.replace(/\n+$/, "");
        // strip leading whitespace
        movesFlat = movesFlat.replace(/^\s+/, "");
        // strip trailing whitespace
        movesFlat = movesFlat.replace(/\s+$/, "");
        const split = movesFlat.split("\n");
        if (split.length === 1 && split[0] === "") {
            $monster.moves = [];
        } else {
            $monster.moves = split;
        }
        editMode = undefined;
    };

    let cardTitle = "";
    let savedString = "";
    $: if ($currCategory !== undefined) {
        cardTitle = `${$monster.name} (saved in bestiary under the category "${$currCategory}")`;
        $monster.category = $currCategory;
        const saved = $bestiary.find((m) => m.name === $monster.name);
        if (saved !== undefined) {
            savedString = stringify(saved);
        }
    } else {
        cardTitle = $monster.name;
    }

    const handleBestiarySave = () => {
        let cat = saveCategory;
        if (cat === "_new") {
            cat = newSaveCategory;
        }
        if (
            !cat.match(/^_/) &&
            !cat.match(/\s/) &&
            !$existingNames.includes($monster.name)
        ) {
            $monster.category = cat;
            $monster = $monster;
            $bestiary.push(JSON.parse(JSON.stringify($monster)));
            $bestiary = $bestiary;
            $lastGen = null;
        } else if ($existingNames.includes($monster.name)) {
            alert(
                `Unable to save to bestiary because a creature already exists with that name.`,
            );
        } else {
            alert(
                `Category names may not start with an underscore or contain any spaces.`,
            );
        }
        showSaveModal = false;
    };

    const handleSaveChanges = () => {
        const idx = $bestiary.findIndex((m) => m.name === $monster.name);
        if (idx !== -1) {
            $bestiary[idx] = JSON.parse(JSON.stringify($monster));
            $bestiary = $bestiary;
        }
    };

    const revertToGen = () => {
        if (
            $lastGen !== null &&
            (!("category" in $monster) ||
                $monster.category === undefined ||
                $monster.category.length === 0)
        ) {
            monster.set(JSON.parse(JSON.stringify($lastGen)));
        }
    };

    const startOver = () => {
        monster.set(JSON.parse(JSON.stringify(blankMonster)));
        $lastGen = null;
        dispatch("switch", { tab: "question" });
    };
</script>

<Card title="{cardTitle}" expandable="{expandable}">
    <div class="media">
        <div
            class="media-left"
            on:click="{() =>
                $monster.media !== undefined && $monster.media.length > 0
                    ? (showModal = true)
                    : (editMode = 'media')}"
        >
            <figure>
                <p class="image is-square">
                    <img src="{$monster.media}" alt="{$monster.name}" />
                </p>
            </figure>
            <br />
            {#if $monster.media !== undefined && $monster.media.length > 0}
                <span
                    class="icon"
                    title="Edit media link"
                    on:click="{(e) => {
                        e.stopPropagation();
                        editMode = 'media';
                    }}"
                >
                    <i class="fa fa-pencil"></i>
                </span>
            {/if}
        </div>
        <div class="modal{showModal ? ' is-active' : ''}">
            <div
                class="modal-background"
                on:click="{() => (showModal = false)}"
            ></div>
            <div class="modal-content">
                <p class="image is-square">
                    <img src="{$monster.media}" alt="{$monster.name}" />
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
                <div
                    class="column is-narrow"
                    on:click="{() => (editMode = 'name')}"
                >
                    {#if editMode === "name"}
                        <div class="control">
                            <input
                                class="input"
                                type="text"
                                bind:value="{$monster.name}"
                                on:blur="{() => (editMode = undefined)}"
                            />
                        </div>
                    {:else}
                        <div class="content">
                            <p><b>{$monster.name}</b></p>
                        </div>
                    {/if}
                </div>
                <div
                    class="column"
                    style="padding-left: 1rem"
                    on:click="{() => (editMode = 'tagsGeneral')}"
                >
                    {#if editMode === "tagsGeneral"}
                        <div class="control">
                            <input
                                class="input"
                                type="text"
                                bind:value="{tagsGeneralFlat}"
                                on:blur="{handleGeneralTagChange}"
                            />
                        </div>
                    {:else}
                        <div class="content">
                            <p>
                                {#each $monster.tags.general as tag}
                                    <span class="tag">{tag}</span>&ensp;
                                {/each}
                            </p>
                        </div>
                    {/if}
                </div>
            </div>
            <!-- attack, hp, armor -->
            <div class="columns">
                <div
                    class="column"
                    style="padding-right: 2em;"
                    on:click="{() => (editMode = 'atk')}"
                >
                    {#if editMode === "atk"}
                        <div class="field">
                            <div class="control">
                                <input
                                    class="input"
                                    type="text"
                                    bind:value="{$monster.attack.name}"
                                />
                            </div>
                            <div class="control">
                                <input
                                    class="input"
                                    type="text"
                                    bind:value="{$monster.attack.damage}"
                                />
                            </div>
                        </div>
                        <div class="field">
                            <div class="control">
                                <input
                                    class="input"
                                    type="text"
                                    bind:value="{tagsCombatFlat}"
                                    on:blur="{handleCombatTagChange}"
                                />
                            </div>
                        </div>
                    {:else}
                        <div class="content">
                            <p>
                                <span>
                                    {$monster.attack?.name}
                                </span>
                                <span>
                                    {$monster.attack.damage}
                                </span>
                                <br />
                                <span>
                                    {#each $monster.tags.combat as tag}
                                        <span class="tag">{tag}</span>&ensp;
                                    {/each}
                                </span>
                            </p>
                        </div>
                    {/if}
                </div>
                <div
                    class="column is-narrow"
                    style="padding-right: 2rem;"
                    on:click="{() => (editMode = 'hp')}"
                >
                    {#if editMode === "hp"}
                        <div class="control">
                            <input
                                class="input"
                                type="number"
                                min="1"
                                bind:value="{$monster.hp}"
                                on:blur="{() => (editMode = undefined)}"
                            />
                        </div>
                    {:else}
                        <div class="content">
                            {$monster.hp} HP
                        </div>
                    {/if}
                </div>
                <div
                    class="column is-narrow"
                    on:click="{() => (editMode = 'armor')}"
                >
                    {#if editMode === "armor"}
                        <div class="control">
                            <input
                                class="input"
                                type="number"
                                min="1"
                                bind:value="{$monster.armor}"
                                on:blur="{() => (editMode = undefined)}"
                            />
                        </div>
                    {:else}
                        <div class="content">
                            {$monster.armor} Armor
                        </div>
                    {/if}
                </div>
            </div>
            <div class="columns">
                <div
                    class="column"
                    on:click="{() => (editMode = 'tagsSpecial')}"
                >
                    {#if editMode === "tagsSpecial"}
                        <div class="control">
                            <input
                                class="input"
                                type="text"
                                bind:value="{tagsSpecialFlat}"
                                on:blur="{handleSpecialTagChange}"
                            />
                        </div>
                    {:else}
                        <div class="content">
                            <p>
                                <b>Special qualities:&ensp;</b>
                                {#each $monster.tags.special as tag}
                                    <span class="tag">{tag}</span>&ensp;
                                {/each}
                            </p>
                        </div>
                    {/if}
                </div>
            </div>
            <div class="columns">
                <div class="column" on:click="{() => (editMode = 'instinct')}">
                    {#if editMode === "instinct"}
                        <div class="control">
                            <input
                                class="input"
                                type="text"
                                bind:value="{$monster.instinct}"
                                on:blur="{() => (editMode = undefined)}"
                            />
                        </div>
                    {:else}
                        <div class="content">
                            <p>
                                <b>Instinct: </b><i>{$monster.instinct}</i>
                            </p>
                        </div>
                    {/if}
                </div>
            </div>
            <hr />
            <div
                on:click="{() => (editMode = 'description')}"
                style="padding-bottom: 1rem;"
            >
                {#if editMode === "description"}
                    <div class="control">
                        <textarea
                            class="textarea"
                            bind:value="{$monster.description}"
                            on:blur="{() => (editMode = undefined)}"
                        ></textarea>
                    </div>
                {:else}
                    <div class="content">
                        {#if $monster.description !== undefined}
                            <SvelteMarkdown source="{$monster.description}" />
                        {/if}
                    </div>
                {/if}
            </div>
            <div on:click="{() => (editMode = 'moves')}">
                {#if editMode === "moves"}
                    <div class="control">
                        <textarea
                            class="textarea"
                            bind:value="{movesFlat}"
                            on:blur="{handleMoveChange}"
                        ></textarea>
                    </div>
                    <p class="help">One move per line. Blank lines are fine.</p>
                {:else}
                    <div class="content">
                        {#if $monster.moves !== undefined && $monster.moves.length > 0}
                            <p><b>Moves:</b></p>
                            <Moves moves="{$monster.moves}" />
                        {:else}
                            <p><i>No special moves.</i></p>
                        {/if}
                    </div>
                {/if}
            </div>
        </div>
    </div>
</Card>

<div class="level" style="padding-top: 1em;">
    <div class="level-item">
        {#if $currCategory !== undefined}
            <button
                class="button apButton"
                disabled="{stringify($monster) === savedString}"
                on:click="{handleSaveChanges}">Save Changes</button
            >
        {:else}
            <button
                class="button apButton"
                on:click="{() => (showSaveModal = true)}"
                >Save to Bestiary</button
            >
        {/if}
    </div>
    {#if $lastGen !== null && $currCategory === undefined}
        <div class="level-item">
            <button class="button" on:click="{revertToGen}"
                >Revert to Generated State</button
            >
        </div>
    {/if}
    <div class="level-item">
        <button class="button" on:click="{startOver}">Start Over</button>
    </div>
</div>

<Modal
    title="Edit Media"
    show="{editMode === 'media'}"
    buttons="{[
        {
            label: 'Close',
            callback: () => (editMode = undefined),
        },
    ]}"
>
    <div class="content">
        <p>
            Provide a link to the image you wish to use. Because of the
            restrictions on local storage, images cannot be embedded. Images
            should be square.
        </p>
    </div>
    <div class="control">
        <input class="input" type="text" bind:value="{$monster.media}" />
    </div>
</Modal>

<Modal
    title="Save to Bestiary"
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
        {#if newSaveCategory.length > 0 && !newSaveCategory.match(/^_/) && !newSaveCategory.match(/\s/) && !$existingNames.includes($monster.name)}
            <div class="control">
                <button class="button apButton" on:click="{handleBestiarySave}"
                    >Save</button
                >
            </div>
        {/if}
    {:else if saveCategory.length > 0}
        <div class="control">
            <button class="button apButton" on:click="{handleBestiarySave}"
                >Save</button
            >
        </div>
    {/if}
</Modal>

<style>
    .media-left {
        width: 25%;
        padding-right: 0.5rem;
    }
    /* .columns {
        padding-bottom: 0.75rem;
    }
    .column {
        padding: 0;
    } */
</style>
