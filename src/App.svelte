<script lang="ts">
    import View from "@/components/View.svelte";
    import Question from "@/components/Question.svelte";
    import Bestiary from "./components/Bestiary.svelte";
    import Footer from "@/components/Footer.svelte";
    import type { Tab } from "@/custom.types";
    import { SvelteToast } from "@zerodevx/svelte-toast";

    let activeTab: Tab = "question";

    function handleSwitch(event: CustomEvent<{ tab: Tab }>) {
        activeTab = event.detail.tab;
    }
</script>

<main class="container p-6">
    <div class="content">
        <p class="title">Dungeon World Bestiary</p>
        <p class="subtitle">Version {__APP_VERSION__}</p>
    </div>

    <div class="tabs">
        <ul>
            <li class="{activeTab === 'question' ? 'is-active' : ''}">
                <a on:click="{() => (activeTab = 'question')}">Questionnaire</a>
            </li>
            <li class="{activeTab === 'view' ? 'is-active' : ''}">
                <a on:click="{() => (activeTab = 'view')}">View/Edit Creature</a
                >
            </li>
            <li class="{activeTab === 'bestiary' ? 'is-active' : ''}">
                <a on:click="{() => (activeTab = 'bestiary')}">Bestiary</a>
            </li>
        </ul>
    </div>

    {#if activeTab === "view"}
        <View on:switch="{handleSwitch}" />
    {:else if activeTab === "question"}
        <Question on:switch="{handleSwitch}" />
    {:else if activeTab === "bestiary"}
        <Bestiary on:switch="{handleSwitch}" />
    {/if}

    <Footer />
</main>
<SvelteToast />

<style>
    /* .logo {
        height: 8em;
        padding: 1.5em;
    }
    #contentContainer {
        width: 100%;
        height: 110vh;
    } */
</style>
