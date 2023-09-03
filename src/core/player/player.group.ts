import { Injectable } from '@nestjs/common';
import { Group } from '~/discord/decorators/group.decorator';
import { GuildService } from '../guild/guild.service';
import { PlayerService } from './player.service';
import { CommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import { Command } from '~/discord/decorators/command.decorator';
import {
  ArgInteraction,
  ArgAuthorMember,
  ArgString,
  ArgPlayer,
  ArgGuild,
} from '~/discord/decorators/message.decorators';
import { Player } from './entities/player.entity';
import { Guild } from '../guild/guild.entity';
import e from 'express';

@Group({
  name: 'pj',
  description: 'Comandos relacionado ao proprio personagem',
})
@Injectable()
export class PlayerGroup {
  constructor(private readonly service: PlayerService) {}

  @Command({
    name: 'atualizar',
    description: 'Adiciona informacoes ao personagem',
  })
  async update(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgGuild()
    guild: Guild,
    @ArgAuthorMember()
    author: GuildMember,
    @ArgString({ name: 'name', required: false })
    name?: string,
    @ArgString({ name: 'avatarUrl', required: false })
    avatarUrl?: string,
  ) {
    const player = await this.service.getOrCreateUpdate(
      {
        discordId: author.id,
        guildId: guild.id,
        avatarUrl,
        name,
      },
      true,
    );
    return player;
  }
  @Command({
    name: 'ver',
    description: 'Mostra as informacoes do personagem',
  })
  async findPlayer(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgPlayer()
    _,
  ) {
    const player = await this.service.findOne({
      where: {
        discordId: interaction.user.id,
        guildId: interaction.guild.id,
      },
      relations: {
        attributes: true,
        abilities: true,
        witchPredilections: true,
        nonConvPredilections: true,
        extras: true,
      },
    });
    const embeds: EmbedBuilder[] = [player.toEmbed()];
    embeds.push(
      player.attributes
        ? player.attributes.toEmbed()
        : new EmbedBuilder()
            .setTitle(`Atributos não configurados`)
            .setDescription('Para configurar use /atb atualizar'),
    );
    embeds.push(
      player.abilities
        ? player.abilities.toEmbed()
        : new EmbedBuilder()
            .setTitle(`Habilidades não configuradas`)
            .setDescription('Para configurar use /[hab1|hab2|hab3] atualizar'),
    );
    embeds.push(
      player.witchPredilections
        ? player.witchPredilections.toEmbed()
        : new EmbedBuilder()
            .setTitle(`Predileções Bruxas não configuradas`)
            .setDescription('Para configurar use /pred_bruxa atualizar'),
    );
    embeds.push(
      player.nonConvPredilections
        ? player.nonConvPredilections.toEmbed()
        : new EmbedBuilder()
            .setTitle(`Predileções não convencionais não configuradas`)
            .setDescription('Para configurar use /pred_nc atualizar'),
    );
    embeds.push(
      player.extras
        ? player.extras.toEmbed()
        : new EmbedBuilder()
            .setTitle(`Informações extras não configuradas`)
            .setDescription('Para configurar use /extras atualizar'),
    );
    await interaction.reply({
      embeds,
      ephemeral: true,
    });
  }
}
