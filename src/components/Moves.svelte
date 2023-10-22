<script lang="ts">
    import SvelteMarkdown from "svelte-markdown";

    export let moves: string[];
</script>

<ul>
    {#each moves as move}
        <li>
            <div class="content"><SvelteMarkdown source="{move}" /></div>
        </li>
    {/each}
</ul>
