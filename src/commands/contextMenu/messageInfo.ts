import { ApplicationCommandType } from "@discordjs/core/http-only";
import { ContextMenuCommandBuilder } from "@discordjs/builders";
import { formatWithOptions } from "node:util";
import { ContextMenuCommand } from "../../structures/index.js";

export default new ContextMenuCommand<"message">({
    async run(app, interaction) {
        const targetMessage = interaction.data.resolved.messages[interaction.data.target_id];

        await app.api.interactions.reply(interaction.id, interaction.token, {
            content: `\`\`\`js\n${formatWithOptions({ depth: 5 }, "%O", targetMessage).slice(0, 1990)}\`\`\``
        });
    },
    data: new ContextMenuCommandBuilder()
        .setName("Info")
        .setType(ApplicationCommandType.Message)
});