import { Injectable } from '@nestjs/common';
import { CommandInteraction } from 'discord.js';
import { ILike } from 'typeorm';
import { Guild } from '~/core/guild/guild.entity';
import { Command } from '~/discord/decorators/command.decorator';
import { Group } from '~/discord/decorators/group.decorator';
import {
  ArgInteraction,
  ArgGuild,
  ArgSpace,
  ArgString,
  ArgInteger,
  ArgBoolean,
} from '~/discord/decorators/message.decorators';
import { Space } from '~/spaces/space/entities/space.entity';
import { InventoryService } from './inventory/inventory.service';
import { ItemDropService } from './item/item-drop.service';
import { ItemService } from './item/item.service';
import { PaginationHelper } from '~/discord/helpers/page-helper';
import { EntityAlreadyExists } from '~/discord/exceptions';
import { MessageCollectorHelper } from '~/discord/helpers/message-collector-helper';

@Group({
  name: 'mod_item',
  description: 'Comandos relacionando ao gerenciamento de itens',
})
@Injectable()
export class ItemModGroup {
  constructor(
    private readonly service: ItemService,
    private readonly itemDropsService: ItemDropService,
    private readonly inventoryService: InventoryService,
  ) {}

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
    })
    imageUrl: string,
    @ArgBoolean({
      name: 'Escondider',
      description: 'Descrição do item',
    })
    hidden: boolean,
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
      hidden,
    });
    await response.edit({
      content: `Item criado com sucesso!`,
      embeds: [item.toEmbed()],
    });

    await descMessage.delete();
  }

  @Command({
    name: 'edit',
    description: 'Edita algum item',
  })
  async editItem(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgGuild() guild: Guild,
    @ArgString({
      name: 'id',
      description: 'Id do item',
    })
    id: string,
    @ArgString({
      name: 'Nome',
      description: 'Nome do item',
      required: false,
    })
    name?: string,
    @ArgString({
      name: 'imageUrl',
      description: 'Url da imagem do item',
      required: false,
    })
    imageUrl?: string,
    @ArgBoolean({
      name: 'Escondider',
      description: 'Descrição do item',
      required: false,
    })
    hidden?: boolean,
    @ArgBoolean({
      name: 'description',
      description: 'Descrição do item',
      required: false,
    })
    changeDescription?: boolean,
  ) {
    await interaction.deferReply({ ephemeral: true });
    const item = await this.service.findOneOrFail({
      where: {
        id,
      },
    });
    let description = item.description;
    if (changeDescription) {
      description = await new MessageCollectorHelper(interaction).prompt(
        'Informe a nova descrição',
      );
    }
    await this.service.update(
      {
        id: item.id,
      },
      {
        name,
        description,
        imageUrl,
        hidden,
      },
    );
    await interaction.followUp({
      content: `Item editado com sucesso!`,
      embeds: [item.toEmbed()],
    });
  }

  @Command({
    name: 'drop',
    description: 'Dropa algum item no local',
    mod: true,
  })
  async forceDropItem(
    @ArgInteraction() i: CommandInteraction,
    @ArgGuild() guild: Guild,
    @ArgSpace() space: Space,
    @ArgString({
      name: 'Nome',
      description: 'Nome do item',
    })
    name: string,
    @ArgInteger({
      name: 'Quantidade',
      description: 'Quantidade de itens',
    })
    amount: number,
    @ArgInteger({
      name: 'Meta Percepção',
      description: 'Quantidade de itens',
    })
    meta: number,
    @ArgBoolean({
      name: 'Pegável',
      description: 'Quantidade de itens',
    })
    takeable: boolean,
  ) {
    await i.deferReply({ ephemeral: true });

    const item = await this.service.findOneOrFail({
      where: {
        name: ILike(name),
        guildId: guild.id,
      },
    });

    const drop = await this.itemDropsService.create({
      item,
      amount,
      space,
      meta,
      takeable,
    });

    await i.followUp({
      content: `Você dropou ${item.name} x${amount}`,
      embeds: [drop.item.toEmbed()],
    });
  }

  @Command({
    name: 'ver',
    description: 'Ver item(s)',
    mod: true,
  })
  async viewItem(
    @ArgInteraction() i: CommandInteraction,
    @ArgGuild() guild: Guild,
    @ArgString({
      name: 'Nome',
      description: 'Nome do item',
    })
    name: string,
  ) {
    await i.deferReply({ ephemeral: true });

    const item = await this.service.findOneOrFail({
      where: {
        name: ILike(name),
        guildId: guild.id,
      },
    });

    await i.followUp({
      embeds: [item.toEmbed()],
    });
  }
  @Command({
    name: 'list',
    description: 'List item(s)',
    mod: true,
  })
  async listItem(
    @ArgInteraction() i: CommandInteraction,
    @ArgGuild() guild: Guild,
  ) {
    await i.deferReply({ ephemeral: true });
    const items = await this.service.findAll({
      where: {
        guildId: guild.id,
      },
    });

    await new PaginationHelper({
      header: `${items.length} itens encontrados`,
      itemsPerPage: 10,
      items,
      formatter: async (item, index, array) => {
        return `### ${item.name}\n${item.description.slice(0, 200)}\n---`;
      },
    }).followUp(i);
  }
  @Command({
    name: 'delete',
    description: 'Delete item(s)',
    mod: true,
  })
  async deleteItem(
    @ArgInteraction() i: CommandInteraction,
    @ArgGuild() guild: Guild,
    @ArgString({
      name: 'id',
      description: 'Id do item',
    })
    id: string,
  ) {
    await i.deferReply({ ephemeral: true });
    const item = await this.service.findOneOrFail({
      where: {
        id,
      },
    });
    await this.service.delete({
      id: item.id,
    });
    await i.followUp({
      content: `Item deletado com sucesso`,
    });
  }
}
