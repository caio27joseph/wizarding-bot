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
  })
  async addHouse(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgRole('cargo')
    role: Role,
  ) {
    const guild = await this.guildService.loadGuildAsMod(interaction, {
      cups: true,
    });
    const house = this.service.create({
      guild,
      discordRoleId: role.id,
      color: role.color,
      imageUrl: role.iconURL(),
      title: role.name,
    });
    return house;
  }

  // @Command({
  //   name: 'remover',
  //   description: 'Remove uma casa existente na mesa',
  // })
  // async removeHouse(
  //   @ArgInteraction() interaction: CommandInteraction,
  //   @ArgRole('cargo')
  //   role: Role,
  // ) {
  //   const guild = await this.guildService.loadGuildAsMod(interaction, {
  //     cups: true,
  //   });
  //   const result = await this.service.remove({
  //     guild,
  //     role,
  //   });
  //   await interaction.reply(`${result.affected} Casa(s) delatada(s)`);
  // }

  // @Command({
  //   name: 'atualizar',
  //   description: 'Atualiza uma casa existente na mesa',
  // })
  // async updateHouse(
  //   @ArgInteraction() interaction: CommandInteraction,
  //   @ArgRole('cargo')
  //   role: Role,
  //   @ArgString({ name: 'titulo', required: false })
  //   title: string,
  //   @ArgString({ name: 'image_url', required: false })
  //   imageUrl: string,
  // ) {
  //   const guild = await this.guildService.loadGuildAsMod(interaction);

  //   const house = await this.service.get({ guild, role });
  //   if (!house) throw new DiscordSimpleError('Casa nao encontrada');

  //   const updated = await this.service.update(house, {
  //     title,
  //     imageUrl,
  //     color: role.color,
  //   });
  //   return updated;
  // }

  @Command({
    name: 'lista',
    description: 'Mostra a lista de casas na mesa',
  })
  async listHouse(@ArgInteraction() interaction: CommandInteraction) {
    const guild = await this.guildService.get(interaction, { houses: true });

    if (!guild.houses) throw new GuildSetupNeeded('Sem casas registradas');
    await interaction.reply({
      embeds: guild.houses.map((h) => h.toEmbeds()),
    });
  }

  // @Command({
  //   name: 'mostrar',
  //   description: 'Mostra detalhes de uma casa',
  // })
  // async showHouse(
  //   @ArgInteraction() interaction: CommandInteraction,
  //   @ArgRole('Casa')
  //   role: Role,
  // ) {
  //   const guild = await this.guildService.get(interaction);
  //   const house = await this.service.get({ guild, role });
  //   if (!house)
  //     throw new DiscordSimpleError('Nao consegui encontrar a casa em questao');
  //   return house;
  // }
}
