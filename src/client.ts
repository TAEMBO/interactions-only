import fs from "node:fs";
import { InteractionResponseType, verifyKeyMiddleware } from "discord-interactions";
import { EventEmitter } from "node:events";
import { GuildMember, BaseInteraction, User, ChatInputCommandInteraction } from "./utilities.js";
import config from './config.json' assert { type: 'json' };
import { REST } from "@discordjs/rest";
import { Options, MessagePayLoad, TypedRequest } from "./typings.js";
import { APIEmbed, APIInteraction, APIMessage, InteractionType, ApplicationCommandType, ComponentType, Routes, APIUser, APIGuildMember, APIGuild, APIChannel } from "discord-api-types/v10";
import { Collection } from "@discordjs/collection";

export default class Client extends EventEmitter {
    rest = new REST().setToken(this.options.token);
    users = new Collection<string, User>();
    members = new Collection<string, GuildMember>();
    guilds = new Collection<string, any>();
    commands = new Collection<string, any>();
    channels = new Collection<string, any>();

    constructor(public options: Options) {
        super();
    }

    getInteraction(data: any) {
        const interactionStructure = (() => {
            if (data.type === InteractionType.ApplicationCommand) {
                return new ChatInputCommandInteraction(data, this);
            } else {
                return new BaseInteraction(data, this);
            }
        })();

        this.emit("interaction", interactionStructure);

        return interactionStructure;
    };

    async sendDm(userId: string, data: MessagePayLoad) {
        const dmFetch = await this.rest.post(Routes.userChannels(), {
            body: {
                recipient_id: userId
            }
        }) as Record<any, any>;

        if (!dmFetch) return null;

        return this.rest.post(Routes.channelMessages(dmFetch.id), {
            body: {
                content: data.content ? data.content : "",
                embeds: data.embeds?.map(x => x),
                components: data.components?.map((component) => (this.isJSON(component) ? component : component.toJSON())),
                attachments: data.files?.map((file, index) => ({ id: index.toString(), description: file.description })),
            }
        });
    }

    async send(channelId: string, data: MessagePayLoad) {
        return this.rest.post(Routes.channelMessages(channelId), {
            body: {
                content: data.content ? data.content : "",
                embeds: data.embeds?.map(x => x),
                components: data.components?.map((component) => (this.isJSON(component) ? component : component.toJSON())),
                attachments: data.files?.map((file, index) => ({ id: index.toString(), description: file.description })),
            }
        });
    }

    async getMsg(channelId: string, messageId: string) {
        return this.rest.get(Routes.channelMessage(channelId, messageId)) as Promise<APIMessage>;
    }

    async getUser(userId: string) {
        const cachedUser = this.users.get(userId);

        if (cachedUser) return cachedUser;

        const response = await this.rest.get(Routes.user(userId)) as APIUser;

        if (!response) return null;

        const userData = new User(response);

        this.users.set(userId, userData);

        return userData;
    }

    async getMember(guildId: string, userId: string) {
        const cachedMember = this.members.get(`${guildId}_${userId}`);

        if (cachedMember) return cachedMember;

        const response = await this.rest.get(Routes.guildMember(guildId, userId)) as APIGuildMember;

        if (!response) return null;

        const memberData = new GuildMember(response);

        this.members.set(`${guildId}_${userId}`, memberData);

        return memberData;
    }

    async getGuild(guildId: string) {
        const guildCache = this.guilds.get(guildId);

        if (guildCache) return guildCache;

        const response = await this.rest.get(Routes.guild(guildId)) as APIGuild;

        if (!response) return null;

        this.guilds.set(guildId, response);

        return response;
    }

    async getChannel(channelId: string) {
        const channelCache = this.channels.get(channelId);

        if (channelCache) return channelCache;

        const response = await this.rest.get(Routes.channel(channelId)) as APIChannel;

        if (!response) return null;

        this.channels.set(channelId, response);

        return response;
    }

    async getChannels(guildId: string) {
        return this.rest.get(Routes.guildChannels(guildId));
    }

    isJSON(data: any) {
        return data !== null && typeof data === "object" && "toJSON" in data;
    }
}