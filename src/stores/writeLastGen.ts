import { writable } from "svelte/store";
import type { Monster } from "@/schemas/bestiary";

let initialState: Monster | null = null;

if (localStorage.getItem("lastGen") !== null) {
    initialState = JSON.parse(localStorage.getItem("lastGen")!) as Monster;
}

export const lastGen = writable(initialState);

lastGen.subscribe((v) => {
    localStorage.setItem("lastGen", JSON.stringify(v));
});
