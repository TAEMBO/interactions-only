import type { APIChatInputApplicationCommandInteraction } from "@discordjs/core/http-only";
import type { InteractionOptionResolver } from "@sapphire/discord-utilities";
import type App from "../app.js";
import type { CombinedSlashCommandBuilder } from "#typings";

/**
 * Creates a new instance of an application command
 */
export class ChatInputCommand {
    /** The function that is ran for this command */
    public run: (app: App, interaction: APIChatInputApplicationCommandInteraction, options: InteractionOptionResolver) => Promise<any>;
    /** The builder data for this command */
    public readonly data: CombinedSlashCommandBuilder;

    public constructor(commandData: ChatInputCommand) {
        this.run = commandData.run;
        this.data = commandData.data;
    }
}