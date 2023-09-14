import { Injectable } from '@nestjs/common';
import { CommandInteraction } from 'discord.js';
import { Command } from '~/discord/decorators/command.decorator';
import { Group } from '~/discord/decorators/group.decorator';
import {
  ArgBoolean,
  ArgInteraction,
  ArgSpace,
  ArgString,
} from '~/discord/decorators/message.decorators';
import { Space } from '~/spaces/space/entities/space.entity';
import { ShopService } from './shop/shop.service';

@Group({
  name: 'mod_economy',
  description: 'Comandos de economia para moderadores',
})
@Injectable()
export class EconomyModGroup {
  constructor(private readonly shopService: ShopService) {}

  @Command({
    name: 'shop_create',
    description: 'Cria uma loja',
    mod: true,
  })
  async shopCreate(
    @ArgInteraction() i: CommandInteraction,
    @ArgSpace() space: Space,
    @ArgString({ name: 'nome', description: 'Nome da loja', required: false })
    name?: string,
    @ArgBoolean({
      name: 'Infinito',
      description: 'Define se a loja tem estoque infinito',
      required: false,
    })
    infinite?: boolean,
  ) {
    await i.deferReply({ ephemeral: true });

    const shop = await this.shopService.create({
      name: name ?? i.channel.name,
      space,
      infinite,
    });

    return i.followUp({
      content: `Loja criada com sucesso!`,
      embeds: [shop.toEmbed()],
    });
  }
}
