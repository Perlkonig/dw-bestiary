import { writable, derived, type Readable } from "svelte/store";
import type { Monster } from "@/schemas/bestiary";
import { bestiary } from "./writeBestiary";

export const blankMonster: Monster = {
    name: "Unnamed",
    tags: {
        general: ["tag1"],
        combat: ["close"],
        special: ["nothing special"],
    },
    hp: 0,
    armor: 0,
    attack: { name: "unknown", damage: "0" },
    instinct: "to kill",
};

let initialState: Monster = JSON.parse(JSON.stringify(blankMonster));

if (localStorage.getItem("currMonster") !== null) {
    initialState = JSON.parse(localStorage.getItem("currMonster")!) as Monster;
}

export const currMonster = writable(initialState);

export const currCategory: Readable<string | undefined> = derived(
    [currMonster, bestiary],
    ([m, b], set) => {
        const saved = b.find((x) => x.name === m.name);
        if (saved !== undefined) {
            set(saved.category);
        } else {
            set(undefined);
        }
    },
);

currMonster.subscribe((v) => {
    localStorage.setItem("currMonster", JSON.stringify(v));
});
