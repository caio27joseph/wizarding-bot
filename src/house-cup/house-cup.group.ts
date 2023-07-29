import { Injectable, UseGuards } from '@nestjs/common';
import { HouseCupService } from './house-cup.service';
import {
  CommandInteraction,
  GuildMember,
  Interaction,
  discordSort,
} from 'discord.js';

import { ModGuard } from '~/core/guards/mod.guard';
import { GuildService } from '~/core/guild/guild.service';
import { HouseCup, HousePointResult, PointLog } from './house-cup.entity';
import {
  ArgInteraction,
  ArgAuthorMember,
  ArgString,
  ArgInteger,
  ArgUser,
} from '~/discord/decorators/message.decorators';
import { Command } from '~/discord/decorators/command.decorator';
import { Group } from '~/discord/decorators/group.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Guild } from '~/core/guild/guild.entity';
import { Repository } from 'typeorm';
import { DiscordSimpleError, GuildSetupNeeded } from '~/discord/exceptions';
import { PlayerService } from '~/core/player/player.service';
import { House } from '~/core/house/house.entity';
import { Player } from '~/core/core.entity';

@Group({
  name: 'taca',
  description: 'Comandos relacionado ao jogador',
})
@Injectable()
export class HouseCupGroup {
  constructor(
    private readonly service: HouseCupService,
    private readonly playerService: PlayerService,
    private guildService: GuildService,
  ) {}

  @Command({
    name: 'iniciar',
    description: 'Inicia uma nova taca das casas',
  })
  public async startCup(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgAuthorMember() author: GuildMember,
    @ArgString({
      name: 'name',
      description: 'O nome da taca das casas, exemplo: Taca de 1999',
    })
    name: string,
  ) {
    const guild = await this.guildService.loadGuildAsMod(interaction, {
      cups: true,
    });

    let cup: HouseCup;
    if (!guild?.cups || guild.cups.length === 0) {
      cup = await this.service.createCup(name, guild);
    } else {
      cup = guild.cups.at(-1);
    }
    return this.service.activateCup(cup);
  }

  @Command({
    name: 'pts',
    description: 'Adiciona ou retira pontos de algum jogador',
  })
  public async addPoints(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgAuthorMember() author: GuildMember,
    @ArgInteger({
      name: 'Quantidade',
      description:
        'Quantidade de pontos que o jogador ira perder ou ganhar para a sua casa',
    })
    value: number,
    @ArgUser({
      name: 'jogador',
      description: 'Verifica o total de pontos',
    })
    target: GuildMember,
  ) {
    const guild = await this.guildService.loadGuildAsMod(interaction);

    const cup = await this.service.getActiveCup({ guild });

    const player = await this.playerService.getOrCreateByMember(guild, target);
    const log = await this.service.addPoints(cup, player, value);
    return log;
  }
  @Command({
    name: 'total',
    description: 'Adiciona ou retira pontos de algum jogador',
  })
  public async totalPoints(@ArgInteraction() interaction: CommandInteraction) {
    const guild = await this.guildService.get(interaction, {
      houses: true,
    });
    const cup = await this.service.getActiveCup({ guild }, { pointLogs: true });
    if (!cup)
      throw new DiscordSimpleError('Não existe uma taca ativa no momento');
    if (guild.houses.length === 0)
      throw new GuildSetupNeeded('Você precisa configurar as casas primeiro');

    const housesById: { [k: string]: House } = {};
    const logsByHouseId: { [key: string]: PointLog[] } = {};
    const totalToCalculate: { [key: string]: number } = {};
    // group log by player

    for (const house of guild.houses) {
      housesById[house.id] = house;
      logsByHouseId[house.id] = [];
      totalToCalculate[house.id] = 0;
    }
    for (const log of cup.pointLogs) {
      if (!(log.houseId in logsByHouseId)) continue;
      logsByHouseId[log.houseId].push(log);
      totalToCalculate[log.houseId] += log.value;
    }

    const results: HousePointResult[] = [];
    // now separe by HousePointResult
    for (const house of guild.houses) {
      results.push(new HousePointResult(house, logsByHouseId[house.id]));
    }

    const total: Array<[string, number]> = [];
    for (const [k, v] of Object.entries(totalToCalculate)) total.push([k, v]);

    const message = this.service.getTotalDisplay(
      interaction as Interaction,
      results,
    );
    await interaction.reply(message);
  }

  @Command({
    name: 'playerLog',
    description: 'Lista de pontos de determinado player',
  })
  public async playerLog(
    @ArgInteraction() interaction: CommandInteraction,

    @ArgUser({
      name: 'jogador',
      description: 'Verifica o total de pontos',
    })
    target: GuildMember,
  ) {
    const guild = await this.guildService.loadGuildAsMod(interaction);
    const player = await this.playerService.getOrCreateByMember(guild, target, {
      pointLogs: true,
    });
    const logs = player.pointLogs;
    await interaction.reply({
      embeds: logs.map((h) => h.toEmbeds()),
    });
  }
}
