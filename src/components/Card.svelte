<script lang="ts">
    export let icon: string | undefined = undefined;
    export let title: string;
    export let expanded = true;
    export let expandable = true;
</script>

<div class="card">
    <header
        class="card-header"
        on:click="{() =>
            expandable ? (expanded = !expanded) : (expanded = expanded)}"
    >
        <p class="card-header-title">
            {#if icon !== undefined}
                <span class="icon"
                    ><i class="{icon}" aria-hidden="true"></i></span
                >&nbsp;
            {/if}
            {@html title}
        </p>
        {#if expandable}
            <button class="card-header-icon" aria-label="more options">
                <span class="icon">
                    {#if expanded}
                        <i class="fa fa-angle-down" aria-hidden="true"></i>
                    {:else}
                        <i class="fa fa-angle-left" aria-hidden="true"></i>
                    {/if}
                </span>
            </button>
        {/if}
    </header>
    {#if expanded}
        <div class="card-content">
            <slot />
        </div>
    {/if}
</div>
