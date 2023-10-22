import { writable } from "svelte/store";
import type { DungeonWorldMonsterGeneratorQuestionnaire } from "@/schemas/monstergen";

export const blankQuestion: DungeonWorldMonsterGeneratorQuestionnaire = {
    group: "",
    size: "",
    knownfor: [],
};

let initialState = { ...blankQuestion };

if (localStorage.getItem("lastQuestion") !== null) {
    initialState = JSON.parse(
        localStorage.getItem("lastQuestion")!,
    ) as DungeonWorldMonsterGeneratorQuestionnaire;
}

export const lastQuestion = writable(initialState);

lastQuestion.subscribe((v) => {
    localStorage.setItem("lastQuestion", JSON.stringify(v));
});
