import { ConsoleLogger, Inject, Injectable, forwardRef } from '@nestjs/common';
import {
  CommandInteraction,
  GuildMember,
  Interaction,
  Role,
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
  ArgPlayer,
  ArgRole,
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
import { Player } from '~/core/player/entities/player.entity';
import { PaginationHelper } from '~/discord/helpers/page-helper';

@Group({
  name: 'taca',
  description: 'Comandos relacionado ao jogador',
})
@Injectable()
export class HouseCupGroup {
  constructor(
    private readonly logger: ConsoleLogger,
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

    if (samePodium) return;

    const fetchedChannel = await this.discordEmitter.client.channels.fetch(
      channelId,
    );
    if (!fetchedChannel.isTextBased()) return;
    const channel = fetchedChannel as TextChannel;

    if (lastMessageId) {
      try {
        const message = await channel.messages.fetch(lastMessageId);
        await message.delete();
      } catch (e) {
        this.logger.error(e);
      }
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

  @Cron('0 0 0 * * *')
  async updateShowcase() {
    this.logger.debug('Updating showcase');
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

    for (const cup of cups) {
      const showcase = await this.showcaseService.findOne({
        where: { id: cup.showCaseId },
      });
      if (!showcase) continue;
      const houses = await this.houseService.findAll({
        where: { guildId: cup.guildId },
      });
      if (houses.length === 0) continue;
      await this.handleShowCase(showcase, cup.pointLogs, houses);
    }
  }

  @Command({
    name: 'showcase',
    description: 'Define esse canal para receber os showcases',
    mod: true,
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
    @ArgString({
      name: 'motivo',
      description: 'Motivo da adicao ou remocao de pontos',
    })
    reason: string,
  ) {
    const cup = await this.service.getActiveCup({ guild });
    if (!cup)
      throw new DiscordSimpleError(
        'Nenhuma taça ativa, crie usando /taca iniciar',
      );
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
    const log = await this.pointLogsService.addPoints(
      cup,
      player,
      value,
      interaction.channelId,
      reason,
    );
    await interaction.reply({
      content:
        `<@${target.id}> recebeu ${value} pontos` +
        (reason ? `\n***Motivo: ${reason}***` : ''),
    });

    if (!guild.pointLogChannelId) return;
    await guild.pointLogChannel.send({
      content:
        `<@${target.id}> recebeu ${value} pontos para <@&${log.house.discordRoleId}> - <#${interaction.channelId}>` +
        (reason ? `\n***Motivo: ${reason}***` : ''),
    });

    return;
  }

  @Command({
    name: 'cancelar_ponto_casa',
    description: 'Cancela o acontecimento de ponto dado a jogador',
    mod: true,
  })
  async cancelPointGiven(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgGuild()
    guild: Guild,
    @ArgString({
      name: 'ID',
      description: 'Id de cancelamento informado no log',
    })
    id: string,
  ) {
    const log = await this.pointLogsService.findOne({
      where: {
        id,
        player: {
          guildId: guild.id,
        },
      },
      relations: {
        player: true,
      },
    });
    if (!log) {
      throw new DiscordSimpleError('Ponto não encontrado');
    }

    const removed = await this.pointLogsService.remove({ id: log.id });

    await interaction.reply({
      content: `${removed.affected} log cancelado...`,
      embeds: [log.toEmbed()],
      ephemeral: true,
    });
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

  @Command({
    name: 'log',
    description: 'Verifica a lista de pontos de um jogador/casa',
  })
  public async playerLog(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgPlayer({
      name: 'Jogador',
      required: false,
      description: 'Verifica o total de pontos',
    })
    target?: Player,
    @ArgRole({
      name: 'Casa',
      required: false,
      description: 'Verifica o total de pontos',
    })
    houseRole?: Role,
  ) {
    if (!target && !houseRole) {
      throw new DiscordSimpleError(
        'Você precisa informar um jogador ou uma casa',
      );
    }
    const logs = await this.pointLogsService.findAll({
      where: {
        house: {
          discordRoleId: houseRole?.id,
        },
        playerId: target?.id,
      },
      relations: {
        house: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    const helper = new PaginationHelper({
      items: logs,
      formatter: async (log) => {
        const dateStringBr = new Date(log.createdAt);
        dateStringBr.setHours(log.createdAt.getHours() - 3);
        let response =
          `${dateStringBr.toLocaleDateString('pt-BR', {
            hour: 'numeric',
            minute: 'numeric',
          })}: <@${log.player.discordId}> recebeu ${log.value} pontos para <@&${
            log.house.discordRoleId
          }>` +
          `${log.reason ? `\n${log.reason}` : ''}` +
          `\n**ID:** ${log.id}\n`;
        return response;
      },
      header: '**Pontos**\n\n',
    });
    await helper.reply(interaction);
  }
}
