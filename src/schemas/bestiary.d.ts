/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type Tags = string[];
/**
 * Structure of a Dungeon World bestiary
 */
export type DungeonWorldBestiary = Monster[];

export interface Monster {
    name: string;
    /**
     * This is how the system knows where to put this monster in the bestiary. Not present in newly generated creatures, but should be present when loading existing ones.
     */
    category?: string;
    description?: string;
    /**
     * Only hyperlinks to media are acceptable. No embedding, for space reasons.
     */
    media?: string;
    tags: {
        general: Tags;
        combat: Tags;
        special: Tags;
    };
    attack: {
        name: string;
        damage: string;
    };
    hp: number;
    armor: number;
    instinct: string;
    moves?: string[];
}
