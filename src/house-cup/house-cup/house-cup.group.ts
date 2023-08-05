import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CommandInteraction, GuildMember, Interaction } from 'discord.js';

import { GuildService } from '~/core/guild/guild.service';
import { HouseCup, HousePointResult } from './entities/house-cup.entity';
import {
  ArgInteraction,
  ArgAuthorMember,
  ArgString,
  ArgInteger,
  ArgUser,
  ArgGuild,
} from '~/discord/decorators/message.decorators';
import { Command } from '~/discord/decorators/command.decorator';
import { Group } from '~/discord/decorators/group.decorator';
import { DiscordSimpleError, GuildSetupNeeded } from '~/discord/exceptions';
import { PointLog } from '../point-logs/entities/point-log.entity';
import { HouseCupService } from './house-cup.service';
import { PointLogsService } from '../point-logs/point-logs.service';
import { House } from '~/core/house/entities/house.entity';
import { PlayerService } from '~/core/player/player.service';
import { Guild } from '~/core/guild/guild.entity';
import { getPriority } from 'os';
import { HouseService } from '~/core/house/house.service';

@Group({
  name: 'taca',
  description: 'Comandos relacionado ao jogador',
})
@Injectable()
export class HouseCupGroup {
  constructor(
    private readonly service: HouseCupService,
    private readonly pointLogsService: PointLogsService,
    private readonly playerService: PlayerService,
    private readonly houseService: HouseService,
  ) {}

  @Command({
    name: 'iniciar',
    description: 'Inicia uma nova taca das casas',
    mod: true,
  })
  public async startCup(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgAuthorMember() author: GuildMember,
    @ArgString({
      name: 'name',
      description: 'O nome da taca das casas, exemplo: Taca de 1999',
    })
    name: string,
    @ArgGuild()
    guild: Guild,
  ) {
    let cup = await this.service.getActiveCup({ guild });
    if (cup) {
      throw new DiscordSimpleError(
        'Ja existe uma taca ativa, finalize ela antes de iniciar uma nova',
      );
    } else {
      cup = await this.service.createCup(name, guild);
    }
    return this.service.activateCup(cup);
  }

  @Command({
    name: 'pts',
    description: 'Adiciona ou retira pontos de algum jogador',
    mod: true,
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
    @ArgGuild() guild: Guild,
  ) {
    const cup = await this.service.getActiveCup({ guild });

    let player = await this.playerService.getOrCreateUpdate({
      discordId: target.user.id,
      guildId: guild.id,
      name: target.nickname || target.displayName || target.user.username,
    });
    if (!player.house) {
      player = await this.playerService.definePlayerHouse(
        guild,
        player,
        target,
      );
    }
    const log = await this.pointLogsService.addPoints(cup, player, value);
    return log;
  }

  @Command({
    name: 'total',
    description: 'Adiciona ou retira pontos de algum jogador',
  })
  public async totalPoints(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgGuild() guild: Guild,
  ) {
    const houses = await this.houseService.findAll({
      where: {
        guildId: guild.id,
      },
    });
    if (houses.length === 0)
      throw new GuildSetupNeeded('Você precisa configurar as casas primeiro');

    const cup = await this.service.getActiveCup(
      { guild },
      {
        pointLogs: {
          player: true,
        },
      },
    );
    if (!cup)
      throw new DiscordSimpleError('Não existe uma taca ativa no momento');

    const housesById: { [k: string]: House } = {};
    const logsByHouseId: { [key: string]: PointLog[] } = {};
    const totalToCalculate: { [key: string]: number } = {};
    // group log by player

    for (const house of houses) {
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
    for (const house of houses) {
      results.push(new HousePointResult(house, logsByHouseId[house.id]));
    }

    const total: Array<[string, number]> = [];
    for (const [k, v] of Object.entries(totalToCalculate)) total.push([k, v]);

    const message = this.service.getTotalDisplay(
      interaction as Interaction,
      results,
      {
        ephemeral: true,
      },
    );
    await interaction.reply(message);
  }

  // @Command({
  //   name: 'playerLog',
  //   description: 'Lista de pontos de determinado player',
  // })
  // public async playerLog(
  //   @ArgInteraction() interaction: CommandInteraction,

  //   @ArgUser({
  //     name: 'jogador',
  //     description: 'Verifica o total de pontos',
  //   })
  //   target: GuildMember,
  // ) {
  //   const guild = await this.guildService.loadGuildAsMod(interaction);
  //   const player = await this.playerService.getOrCreateByMember(guild, target, {
  //     pointLogs: true,
  //   });
  //   const logs = player.pointLogs;
  //   await interaction.reply({
  //     embeds: logs.map((h) => h.toEmbeds()),
  //   });
  // }
}
