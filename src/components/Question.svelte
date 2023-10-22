<script lang="ts">
    import { lastQuestion, blankQuestion } from "@/stores/writeLastQuestion";
    import { lastGen } from "@/stores/writeLastGen";
    import { currMonster } from "@/stores/writeMonster";
    import type { Monster } from "@/schemas/bestiary";
    import { onMount } from "svelte";
    import type { Tab } from "@/custom.types";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher<{ switch: { tab: Tab } }>();
    let knownForSorted: [string, string][];
    let armamentsSorted: [string, string][];
    onMount(() => {
        if ($lastQuestion.size === undefined) {
            $lastQuestion.size = "";
        }
        knownForSorted = [...knownForVals.entries()].sort((a, b) =>
            a[1].localeCompare(b[1]),
        );
        armamentsSorted = [...armamentsVals.entries()].sort((a, b) =>
            a[1].localeCompare(b[1]),
        );
    });

    const resetForm = () => {
        lastQuestion.set(blankQuestion);
    };

    const generate = () => {
        const tagsGeneral = new Set<string>();
        if (
            $lastQuestion.group === undefined ||
            $lastQuestion.group === "" ||
            $lastQuestion.group === "solitary"
        ) {
            tagsGeneral.add("solitary");
        } else {
            tagsGeneral.add($lastQuestion.group);
        }
        if ($lastQuestion.size !== undefined && $lastQuestion.size !== "") {
            tagsGeneral.add($lastQuestion.size);
        }
        const realTags = [
            "stealthy",
            "divine",
            "magical",
            "organized",
            "intelligent",
            "hoarder",
            "terrifying",
            "construct",
            "cautious",
            "planar",
            "amorphous",
            "devious",
        ];
        realTags
            .filter((s) => $lastQuestion.knownfor?.includes(s))
            .forEach((tag) => {
                tagsGeneral.add(tag);
            });
        if ($lastQuestion.knownfor?.includes("warded")) {
            tagsGeneral.add("magical");
        }
        let tagsSpecial = new Set<string>();
        if (
            $lastQuestion.qualities !== undefined &&
            $lastQuestion.qualities.length > 0
        ) {
            // strip newlines
            $lastQuestion.qualities = $lastQuestion.qualities.replace(
                /\n/g,
                "",
            );
            // strip double spaces
            $lastQuestion.qualities = $lastQuestion.qualities.replace(
                /  /g,
                " ",
            );
            // strip spaces after commas
            $lastQuestion.qualities = $lastQuestion.qualities.replace(
                /,\s+/g,
                ",",
            );
            tagsSpecial = new Set<string>($lastQuestion.qualities.split(","));
        }
        const tagsRange = new Set<string>();
        if (
            $lastQuestion.armaments === undefined ||
            $lastQuestion.armaments.length === 0
        ) {
            tagsRange.add("hand");
        } else {
            if ($lastQuestion.armaments.includes("hand")) {
                tagsRange.add("hand");
            }
            if ($lastQuestion.armaments.includes("close")) {
                tagsRange.add("close");
            }
            if ($lastQuestion.armaments.includes("reach")) {
                tagsRange.add("reach");
            }
            if ($lastQuestion.armaments.includes("ranged")) {
                tagsRange.add("near");
            }
        }
        if (tagsRange.size === 0) {
            tagsRange.add("hand");
        }
        if ($lastQuestion.size === "tiny" || $lastQuestion.size === "small") {
            for (const range of ["close", "reach", "near"]) {
                tagsRange.delete(range);
                if (range === "close") {
                    tagsRange.add("hand");
                } else if (range === "reach") {
                    tagsRange.add("close");
                } else if (range === "near") {
                    tagsRange.add("reach");
                }
            }
        } else if (
            $lastQuestion.size === "large" ||
            $lastQuestion.size === "huge"
        ) {
            for (const range of ["near", "reach", "close", "hand"]) {
                tagsRange.delete(range);
                if (range === "hand") {
                    tagsRange.add("close");
                } else if (range === "close") {
                    tagsRange.add("reach");
                } else if (range === "reach") {
                    tagsRange.add("near");
                } else if (range === "near") {
                    tagsRange.add("far");
                }
            }
        }
        const tagsCombat = new Set<string>(tagsRange);
        if (
            $lastQuestion.armaments?.includes("pierceOne") ||
            $lastQuestion.armaments?.includes("pierceTwo")
        ) {
            tagsCombat.add("messy");
        }
        if ($lastQuestion.knownfor?.includes("strong")) {
            tagsCombat.add("forceful");
        }

        let dmgDie = 4;
        switch ($lastQuestion.group) {
            case "solitary":
                dmgDie = 10;
                break;
            case "group":
                dmgDie = 8;
                break;
            case "horde":
                dmgDie = 6;
                break;
        }
        if ($lastQuestion.armaments?.includes("weak")) {
            dmgDie -= 2;
        }
        if ($lastQuestion.knownfor?.includes("devious")) {
            dmgDie -= 2;
        }
        if ($lastQuestion.knownfor?.includes("ancient")) {
            dmgDie += 2;
        }
        if (dmgDie < 4) {
            dmgDie = 4;
        }

        let bonus = 0;
        switch ($lastQuestion.size) {
            case "tiny":
                bonus -= 2;
                break;
            case "large":
                bonus++;
                break;
            case "huge":
                bonus += 3;
        }
        if ($lastQuestion.armaments?.includes("strong")) {
            bonus += 2;
        }
        if ($lastQuestion.knownfor?.includes("divine")) {
            bonus += 2;
        }
        if ($lastQuestion.knownfor?.includes("strong")) {
            bonus++;
        }

        let piercing = 0;
        if ($lastQuestion.armaments?.includes("pierceOne")) {
            piercing = 1;
        } else if ($lastQuestion.armaments?.includes("pierceTwo")) {
            piercing = 3;
        } else if ($lastQuestion.armaments?.includes("pierceThree")) {
            piercing = Infinity;
        }
        if ($lastQuestion.knownfor?.includes("deft")) {
            piercing++;
        }

        let advantage = 0;
        if ($lastQuestion.knownfor?.includes("offensive")) {
            advantage++;
        }
        if ($lastQuestion.knownfor?.includes("pacifist")) {
            advantage--;
        }

        let hp = 0;
        switch ($lastQuestion.group) {
            case "horde":
                hp = 3;
                break;
            case "group":
                hp = 6;
                break;
            case "solitary":
                hp = 12;
                break;
        }
        switch ($lastQuestion.size) {
            case "tiny":
                hp -= 2;
                break;
            case "large":
                hp += 4;
                break;
            case "huge":
                hp += 8;
                break;
        }
        if ($lastQuestion.knownfor?.includes("endurance")) {
            hp += 4;
        }
        if ($lastQuestion.knownfor?.includes("divine")) {
            hp += 2;
        }
        if ($lastQuestion.knownfor?.includes("animated")) {
            hp += 4;
        }
        if ($lastQuestion.knownfor?.includes("amorphous")) {
            hp += 3;
        }

        let armor = 0;
        switch ($lastQuestion.protection) {
            case "1":
                armor = 1;
                break;
            case "2":
                armor = 2;
                break;
            case "3":
                armor = 3;
                break;
            case "4":
                armor = 4;
                break;
        }
        if ($lastQuestion.size === "tiny") {
            armor++;
        }
        if ($lastQuestion.knownfor?.includes("shielded")) {
            armor++;
        }
        if ($lastQuestion.knownfor?.includes("defensive")) {
            armor++;
        }
        if ($lastQuestion.knownfor?.includes("amorphous")) {
            armor++;
        }

        let moves: string[] = [];
        if (
            $lastQuestion.moves !== undefined &&
            $lastQuestion.moves.length > 0
        ) {
            // strip double newlines
            $lastQuestion.moves = $lastQuestion.moves.replace(/\n\n/g, "\n");
            // strip double spaces
            $lastQuestion.moves = $lastQuestion.moves.replace(/  /g, " ");
            // strip spaces before and after newlines
            $lastQuestion.moves = $lastQuestion.moves.replace(
                /\s*\n\s*/g,
                "\n",
            );
            // strip leading newline
            $lastQuestion.moves = $lastQuestion.moves.replace(/^\n/, "");
            // strip trailing newline
            $lastQuestion.moves = $lastQuestion.moves.replace(/\n$/, "");
            moves = $lastQuestion.moves.split("\n");
        }

        const monster: Monster = {
            name: $lastQuestion.name || "Unnamed",
            description: $lastQuestion.description || "Undescribed",
            tags: {
                general: [...tagsGeneral],
                combat: [...tagsCombat],
                special: [...tagsSpecial],
            },
            attack: {
                name: $lastQuestion.atkname || "Unnamed",
                damage: `(d${dmgDie}${
                    bonus !== 0 ? (bonus > 0 ? `+${bonus}` : bonus) : ""
                } damage${
                    piercing !== 0
                        ? piercing === Infinity
                            ? "; ignores armor"
                            : `; ${piercing} piercing`
                        : ""
                }${
                    advantage !== 0
                        ? advantage < 0
                            ? "; +disadvantage"
                            : "; +advantage"
                        : ""
                })`,
            },
            hp,
            armor,
            instinct: $lastQuestion.instinct || "Aimless and confused",
            moves,
        };
        $lastGen = JSON.parse(JSON.stringify(monster));
        $currMonster = monster;
        dispatch("switch", { tab: "view" });
    };

    const knownForVals: Map<string, string> = new Map<string, string>([
        ["amorphous", "Lacks organs or discernable anatomy"],
        ["ancient", "It (or its species) is ancient"],
        ["animated", "Is animated by more than biology"],
        ["cautious", "Avoids fights, flees early"],
        ["construct", "Was made by someone"],
        ["defensive", "Is skilled in defense"],
        ["deft", "Can make precise, deft strikes"],
        ["devious", "The primary danger isn't from wounds"],
        ["divine", "Has the favor of the gods"],
        ["endurance", "Possesses uncanny endurance"],
        ["hoarder", "Collects trinkets and treasure"],
        ["intelligent", "Is as smart as a person (or smarter)"],
        ["magical", "Has spells or magic"],
        ["offensive", "Is skilled in offense"],
        ["organized", "Works well in groups"],
        ["pacifist", "Abhors violence"],
        ["planar", "Is not of this world"],
        ["shielded", "Bears a shield (or similar)"],
        ["stealthy", "Avoids detection"],
        ["strong", "Possesses unrelenting strength"],
        ["terrifying", "Is disturbing, terrible, or horrible"],
        ["warded", "Is protected by layers of magical wards"],
    ]);
    const handleKnownForChange = (e: Event) => {
        const { value, checked } = e.target as HTMLInputElement;
        const set = new Set<string>($lastQuestion.knownfor);
        if (checked) {
            set.add(value);
        } else {
            set.delete(value);
        }
        $lastQuestion.knownfor = [...set];
    };

    const armamentsVals: Map<string, string> = new Map<string, string>([
        ["close", "Work well at sword's reach"],
        ["hand", "Are useful up close and personal"],
        ["pierceOne", "Can slice/pierce metal"],
        ["pierceThree", "Can ignore armor entirely"],
        ["pierceTwo", "Can tear metal apart"],
        ["ranged", "Are useful at range"],
        ["reach", "Can keep foes at bay"],
        ["strong", "Are vicious and obvious"],
        ["weak", "Are small and weak"],
    ]);
    const handleArmamentChange = (e: Event) => {
        const { value, checked } = e.target as HTMLInputElement;
        const set = new Set<string>($lastQuestion.armaments);
        if (checked) {
            set.add(value);
        } else {
            set.delete(value);
        }
        $lastQuestion.armaments = [...set];
    };
</script>

<article>
    <p>
        Once the creature has been generated, everything can be manually edited.
        This questionnaire just gets you started. <a
            href="https://spoutinglore.blogspot.com/2018/07/monster-creation-cheatsheet.html"
            target="_blank">This is based on the work of Jeremy Strandberg.</a
        >
    </p>
    <hr />
    <form>
        <div class="field">
            <div class="control">
                <button class="button" type="button" on:click="{resetForm}"
                    >Start over</button
                >
            </div>
        </div>
        <div class="field">
            <label class="label" for="monsterName"
                >Give your creature a name</label
            >
            <div class="control">
                <input
                    class="input"
                    type="text"
                    id="monsterName"
                    bind:value="{$lastQuestion.name}"
                />
            </div>
        </div>
        <div class="field">
            <label class="label" for="description"
                >Narratively describe your creature</label
            >
            <div class="control">
                <textarea
                    class="textarea"
                    id="description"
                    bind:value="{$lastQuestion.description}"
                    rows="5"
                ></textarea>
            </div>
            <p class="help">
                You may use basic markdown like <b>**bold**</b> and
                <i>*italic*</i>.
            </p>
        </div>
        <div class="field">
            <label class="label" for="group"
                >How does it usually hunt or fight?</label
            >
            <div class="control">
                <div class="select">
                    <select id="group" bind:value="{$lastQuestion.group}">
                        <option value=""></option>
                        <option value="horde">In large groups</option>
                        <option value="group">In small groups</option>
                        <option value="solitary">By itself</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="field">
            <label class="label" for="size">How big is it?</label>
            <div class="control">
                <div class="select">
                    <select id="size" bind:value="{$lastQuestion.size}">
                        <option value="tiny">Cat sized or smaller</option>
                        <option value="small">Like a human child</option>
                        <option value="">Human sized</option>
                        <option value="large">Horse, cart, etc.</option>
                        <option value="huge">Elephant, house, or bigger</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="field">
            <label class="label" for="atkName"
                >What is the name of the creature's base attack?</label
            >
            <div class="control">
                <input
                    class="input"
                    type="text"
                    id="atkName"
                    bind:value="{$lastQuestion.atkname}"
                />
            </div>
            <p class="help">For example bite, choke, axe, tentacles</p>
        </div>
        <div class="field">
            <label class="label" for="protected">It is protected by...?</label>
            <div class="control">
                <div class="select">
                    <select
                        id="protected"
                        bind:value="{$lastQuestion.protection}"
                    >
                        <option value=""></option>
                        <option value="0">Naught but cloth and flesh</option>
                        <option value="1">Leathers or thick hide</option>
                        <option value="2">Mail, scales, or similar</option>
                        <option value="3">Steel, boney plates, carapace</option>
                        <option value="4">Layers of magical wards</option>
                    </select>
                </div>
            </div>
        </div>
        {#if armamentsSorted !== undefined}
            <div class="field">
                <label class="label">Its armaments...?</label>
                <div class="control">
                    <div class="columns is-multiline">
                        {#each armamentsSorted as [value, text]}
                            <div class="column is-one-third">
                                <label class="checkbox">
                                    <input
                                        type="checkbox"
                                        name="{value}"
                                        value="{value}"
                                        checked="{$lastQuestion.armaments?.includes(
                                            value,
                                        )}"
                                        on:change="{handleArmamentChange}"
                                    />
                                    {text}
                                </label>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        {/if}
        {#if knownForSorted !== undefined}
            <div class="field">
                <label class="label"
                    >What other things is this creature known for?</label
                >
                <div class="control">
                    <div class="columns is-multiline">
                        {#each knownForSorted as [value, text]}
                            <div class="column is-one-third">
                                <label class="checkbox">
                                    <input
                                        type="checkbox"
                                        name="{value}"
                                        value="{value}"
                                        checked="{$lastQuestion.knownfor?.includes(
                                            value,
                                        )}"
                                        on:change="{handleKnownForChange}"
                                    />
                                    {text}
                                </label>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        {/if}
        <div class="field">
            <label class="label" for="instinct"
                >What is your creature's instinct?</label
            >
            <div class="control">
                <input
                    class="input"
                    type="text"
                    id="instinct"
                    bind:value="{$lastQuestion.instinct}"
                />
            </div>
            <p class="help">
                What does it do or want that causes problems for others? Write
                it as an intended action (e.g. <i
                    >to consume the flesh of innocents</i
                >).
            </p>
        </div>
        <div class="field">
            <label class="label" for="qualities"
                >Describe any special qualities based on what it's known for</label
            >
            <div class="control">
                <input
                    class="input"
                    type="text"
                    id="qualities"
                    bind:value="{$lastQuestion.qualities}"
                />
            </div>
            <p class="help">
                Separate qualities with commas. Will appear as tags. Examples
                include useful adaptations (e.g., <i>winged</i>,
                <i>amphibious</i>), a description of what makes it terrifying,
                or what the purpose of its creation was.
            </p>
        </div>
        <div class="field">
            <label class="label" for="moves"
                >Describe any specific moves this creature has</label
            >
            <div class="control">
                <textarea
                    class="textarea"
                    id="moves"
                    bind:value="{$lastQuestion.moves}"
                    rows="5"
                ></textarea>
            </div>
            <p class="help">
                Put each move on its own line. Blank lines are fine. You may use
                basic markdown like <b>**bold**</b> and <i>*italic*</i>.
            </p>
        </div>
        <div class="field is-grouped">
            <div class="control">
                <button
                    class="button apButton"
                    type="button"
                    on:click="{generate}">Generate</button
                >
            </div>
            <div class="control">
                <button class="button" type="button" on:click="{resetForm}"
                    >Start over</button
                >
            </div>
        </div>
    </form>
</article>
