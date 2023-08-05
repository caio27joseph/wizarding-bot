import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  APIEmbed,
  CommandInteraction,
  Guild,
  Interaction,
  Role,
} from 'discord.js';
import { Repository } from 'typeorm';
import { Group } from '~/discord/decorators/group.decorator';
import { Command } from '~/discord/decorators/command.decorator';
import {
  ArgGuild,
  ArgInteraction,
  ArgRole,
  ArgString,
} from '~/discord/decorators/message.decorators';
import { GuildService } from '../guild/guild.service';
import { DiscordSimpleError, GuildSetupNeeded } from '~/discord/exceptions';
import { HouseService } from './house.service';

@Injectable()
@Group({
  name: 'casa',
  description: 'Comandos relacionado as casas',
})
export class HouseGroup {
  constructor(
    private readonly service: HouseService,
    private readonly guildService: GuildService,
  ) {}
  @Command({
    name: 'adicionar',
    description: 'Adiciona uma nova Casa a mesa',
    mod: true,
  })
  async addHouse(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgRole('cargo')
    role: Role,
    @ArgGuild()
    guild: Guild,
  ) {
    const house = this.service.create({
      guildId: guild.id,
      discordRoleId: role.id,
      color: role.color,
      imageUrl: role.iconURL(),
      title: role.name,
    });
    return house;
  }

  @Command({
    name: 'remover',
    description: 'Remove uma casa existente na mesa',
    mod: true,
  })
  async removeHouse(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgRole('cargo')
    role: Role,
    @ArgGuild() guild: Guild,
  ) {
    const result = await this.service.remove({
      guildId: guild.id,
      discordRoleId: role.id,
    });
    await interaction.reply(`${result.affected} Casa(s) delatada(s)`);
  }

  @Command({
    name: 'atualizar',
    description: 'Atualiza uma casa existente na mesa',
    mod: true,
  })
  async updateHouse(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgRole('cargo')
    role: Role,
    @ArgString({ name: 'titulo', required: false })
    title: string,
    @ArgString({ name: 'image_url', required: false })
    imageUrl: string,
    @ArgGuild() guild: Guild,
  ) {
    const house = await this.service.findOne({
      where: {
        guildId: guild.id,
        discordRoleId: role.id,
      },
    });
    if (!house) throw new DiscordSimpleError('Casa nao encontrada');

    const updated = await this.service.update(
      {
        id: house.id,
      },
      {
        title,
        imageUrl,
        color: role.color,
      },
    );
    return await this.service.findOne({ where: { id: house.id } });
  }

  @Command({
    name: 'lista',
    description: 'Mostra a lista de casas na mesa',
  })
  async listHouse(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgGuild() guild: Guild,
  ) {
    const houses = await this.service.findAll({
      where: {
        guildId: guild.id,
      },
    });
    if (!houses) throw new GuildSetupNeeded('Sem casas registradas');
    await interaction.reply({
      embeds: houses.map((h) => h.toEmbeds()),
      ephemeral: true,
    });
  }

  @Command({
    name: 'mostrar',
    description: 'Mostra detalhes de uma casa',
  })
  async showHouse(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgRole('Casa')
    role: Role,
  ) {
    const guild = await this.guildService.get(interaction);
    const house = await this.service.findOne({
      where: {
        guildId: guild.id,
        discordRoleId: role.id,
      },
    });
    if (!house)
      throw new DiscordSimpleError('Nao consegui encontrar a casa em questao');
    return house;
  }
}
