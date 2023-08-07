import { Inject, Injectable, forwardRef } from '@nestjs/common';
import {
  CommandInteraction,
  GuildMember,
  Interaction,
  TextChannel,
} from 'discord.js';

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
import { CupShowCaseService } from './cup-show-case.service';
import { Cron } from '@nestjs/schedule';
import { IsNull, Not } from 'typeorm';
import { DiscordEventEmitter } from '~/discord/discord.event-emitter';
import { CupShowCase } from './entities/cup-show-case.entity';

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
    private readonly showcaseService: CupShowCaseService,
    private readonly discordEmitter: DiscordEventEmitter,
  ) {}

  async handleShowCase(
    { id, channelId, lastMessageId, podiums, message: content }: CupShowCase,
    pointLogs: PointLog[],
    houses: House[],
  ) {
    const results = this.service.calculateTotal(pointLogs, houses);
    const newPodium = await this.showcaseService.getPodiums(results);
    const samePodium = this.showcaseService.isEqual(podiums || [], newPodium);

    if (false) return;

    const fetchedChannel = await this.discordEmitter.client.channels.fetch(
      channelId,
    );
    if (!fetchedChannel.isTextBased()) return;
    const channel = fetchedChannel as TextChannel;

    if (lastMessageId) {
      const message = await channel.messages.fetch(lastMessageId);
      await message.delete();
    }
    const payload = this.service.getTotalDisplay(results);

    const message = await channel.send({ content, ...payload });

    await this.showcaseService.update(
      { id },
      {
        podiums: newPodium,
        lastMessageId: message.id,
      },
    );
  }

  @Cron('0 5 * * *')
  @Cron('0 15 * * *')
  async updateShowcase() {
    const cups = await this.service.findAll({
      where: {
        active: true,
        showCaseId: Not(IsNull()),
      },
      relations: {
        guild: true,
        pointLogs: true,
      },
    });
    const allCups = await this.service.findAll({
      where: {
        active: true,
      },
      relations: {
        guild: true,
        pointLogs: true,
      },
    });

    for (const cup of cups) {
      const showcase = await this.showcaseService.findOne({
        where: { id: cup.showCaseId },
      });
      const houses = await this.houseService.findAll({
        where: { guildId: cup.guildId },
      });
      await this.handleShowCase(showcase, cup.pointLogs, houses);
    }
  }

  @Command({
    name: 'showcase',
    description: 'Define esse canal para receber os showcases',
  })
  public async showcase(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgGuild() guild: Guild,
    @ArgString({
      name: 'message',
      description:
        'Mensagem que sera enviada junto com o showcase, marque casas, cargos etc...',
      required: false,
    })
    message?: string,
  ) {
    const cup = await this.service.getActiveCup(
      { guild },
      {
        guild: true,
        pointLogs: true,
      },
    );
    if (!cup) {
      throw new DiscordSimpleError(
        'Nenhuma taça ativa, crie usando /taca iniciar',
      );
    }
    const showCase = await this.showcaseService.findOne({
      where: { cupId: cup.id },
    });
    const houses = await this.houseService.findAll({
      where: { guildId: guild.id },
    });
    if (!showCase) {
      const showCase = await this.showcaseService.create({
        channelId: interaction.channel.id,
        lastMessageId: null,
        podiums: [],
        message: message || cup.name,
        cupId: cup.id,
      });
      await interaction.reply({
        content:
          'Showcase criado com sucesso\nLembre-se que eu preciso de permissoes explicitas configuradas no meu cargo aqui no canal',
        ephemeral: true,
      });
      await this.handleShowCase(showCase, cup.pointLogs, houses);
      await this.service.update(cup.id, {
        showCaseId: showCase.id,
      });
      return;
    }
    await this.showcaseService.update(
      { id: showCase.id },
      {
        channelId: interaction.channel.id,
        podiums: null,
        message: message || showCase.message,
      },
    );

    await this.service.update(cup.id, {
      showCaseId: showCase.id,
    });

    await interaction.reply({
      content:
        'Showcase atualizado com sucesso\nLembre-se que eu preciso de permissoes explicitas configuradas no meu cargo aqui no canal',
      ephemeral: true,
    });
    await this.handleShowCase(showCase, cup.pointLogs, houses);
    return;
  }

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

    const results = this.service.calculateTotal(cup.pointLogs, houses);

    const message = this.service.getTotalDisplay(results);
    await interaction.reply({ ...message, ephemeral: true });
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
