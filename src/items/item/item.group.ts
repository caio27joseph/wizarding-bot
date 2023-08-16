import { CommandInteraction } from 'discord.js';
import { Command } from '~/discord/decorators/command.decorator';
import { Group } from '~/discord/decorators/group.decorator';
import {
  ArgGuild,
  ArgInteraction,
  ArgString,
} from '~/discord/decorators/message.decorators';
import { ItemService } from './item.service';
import { Injectable } from '@nestjs/common';
import { ILike } from 'typeorm';
import { EntityAlreadyExists } from '~/discord/exceptions';
import { Guild } from '~/core/guild/guild.entity';

@Group({
  name: 'item',
  description: 'Comandos relacionando ao gerenciamento de itens',
})
@Injectable()
export class ItemGroup {
  constructor(private readonly service: ItemService) {}

  @Command({
    name: 'create',
    description: 'Create item(s)',
  })
  async createItem(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgGuild() guild: Guild,
    @ArgString({
      name: 'Nome',
      description: 'Nome do item',
    })
    name: string,
    @ArgString({
      name: 'imageUrl',
      description: 'Url da imagem do item',
      required: false,
    })
    imageUrl?: string,
  ) {
    const itemExists = await this.service.findOne({
      where: {
        name: ILike(name),
      },
    });
    if (itemExists) throw new EntityAlreadyExists('Item', name);
    const response = await interaction.reply({
      content: 'Criando item... Informe a Descrição',
    });
    const collected = await interaction.channel.awaitMessages({
      filter: (i) => i.author.id === interaction.user.id,
      time: 60000,
      max: 1,
    });
    const descMessage = collected.first();
    const description = descMessage.content;
    const item = await this.service.create({
      name,
      description,
      imageUrl,
      guildId: guild.id,
    });
    await response.edit({
      content: `Item criado com sucesso!`,
      embeds: [item.toEmbed()],
    });

    await descMessage.delete();
  }
  @Command({
    name: 'update',
    description: 'Update item(s)',
  })
  async updateItem(
    @ArgInteraction() i: CommandInteraction,
    @ArgGuild() guild: Guild,
  ) {}
  @Command({
    name: 'delete',
    description: 'Delete item(s)',
  })
  async deleteItem(
    @ArgInteraction() i: CommandInteraction,
    @ArgGuild() guild: Guild,
  ) {}
  @Command({
    name: 'list',
    description: 'List item(s)',
  })
  async listItem(
    @ArgInteraction() i: CommandInteraction,
    @ArgGuild() guild: Guild,
  ) {}
  @Command({
    name: 'get',
    description: 'Get item(s)',
  })
  async getItem(
    @ArgInteraction() i: CommandInteraction,
    @ArgGuild() guild: Guild,
  ) {}
}
