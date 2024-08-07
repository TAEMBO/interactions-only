import type { APIUserApplicationCommandInteraction, APIMessageApplicationCommandInteraction } from "@discordjs/core/http-only";
import type { ContextMenuCommandBuilder } from "@discordjs/builders";
import type { InteractionOptionResolver } from "@sapphire/discord-utilities";
import type App from "../app.js";

/**
 * Creates a new instance of an application command
 */
export class ContextMenuCommand<
    TCommand extends "message" | "user",
    TInteraction = TCommand extends "message"
        ? APIMessageApplicationCommandInteraction
        : APIUserApplicationCommandInteraction,
> {
    /** The function that is ran for this command */
    public run: (app: App, interaction: TInteraction, options: InteractionOptionResolver) => Promise<any>;
    /** The builder data for this command */
    public readonly data: ContextMenuCommandBuilder;

    public constructor(commandData: ContextMenuCommand<TCommand, TInteraction>) {
        this.run = commandData.run;
        this.data = commandData.data;
    }
}