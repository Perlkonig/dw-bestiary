import { writable, derived, type Readable } from "svelte/store";
import type { DungeonWorldBestiary } from "@/schemas/bestiary";

let initialState: DungeonWorldBestiary = [];

if (localStorage.getItem("bestiary") !== null) {
    initialState = JSON.parse(
        localStorage.getItem("bestiary")!,
    ) as DungeonWorldBestiary;
}

export const bestiary = writable(initialState);

export const existingCategories: Readable<string[]> = derived(
    bestiary,
    (b, set) => {
        const categories = b
            .map((m) => m.category)
            .filter((c) => c !== undefined && c.length > 0) as string[];
        const unique = new Set<string>(categories);
        const sorted = [...unique.values()];
        sorted.sort((a, b) => a.localeCompare(b));
        set([...sorted]);
    },
);
export const existingNames: Readable<string[]> = derived(bestiary, (b, set) => {
    set([...b.map((m) => m.name)]);
});

bestiary.subscribe((v) => {
    localStorage.setItem("bestiary", JSON.stringify(v));
});
