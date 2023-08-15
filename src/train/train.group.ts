import { Injectable } from '@nestjs/common';
import { Group } from '~/discord/decorators/group.decorator';
import { TrainService } from './train.service';
import {
  APISelectMenuOption,
  ActionRowBuilder,
  Attachment,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CacheType,
  CommandInteraction,
  EmbedBuilder,
  Message,
  MessageComponentInteraction,
  StringSelectMenuInteraction,
  TextChannel,
} from 'discord.js';
import { StringSelectMenuBuilder } from '@discordjs/builders';
import { PlayerService } from '~/core/player/player.service';
import { Player } from '~/core/player/entities/player.entity';
import { Spell, maestryNumToName } from '~/spell/entities/spell.entity';
import { RollService } from '~/roll/roll.service';
import {
  WitchPredilectionsNameEnum,
  witchPredilectionsNameMap,
} from '~/player-system/witch-predilection/entities/witch-predilection.entity';
import { Train, TrainGroupOption } from './entities/train.entity';
import { ILike, IsNull, MoreThan, Not } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Guild } from '~/core/guild/guild.entity';
import { Command } from '~/discord/decorators/command.decorator';
import {
  ArgGuild,
  ArgInteger,
  ArgInteraction,
  ArgPlayer,
  ArgString,
} from '~/discord/decorators/message.decorators';
import { groupBy, sumBy } from 'lodash';
import { createCanvas } from 'canvas';
import { PaginationHelper } from '~/discord/helpers/page-helper';
import { RollsD10 } from '~/roll/entities/roll.entity';
import { SpellService } from '~/spell/spell.service';
import { DiscordSimpleError } from '~/discord/exceptions';
import { SpellActionContext } from '~/spell/spell.group';
import { TrainSpellService } from './train-spell.service';

export enum SpellTrainAction {
  SELECT_GROUP = 'spell-train-group-select',
  SELECT_ROLL = 'spell-train-tests-select',
  CANCEL = 'spell-train-cancel',
  SUBMIT = 'spell-train-submit',
  BONUS_ROLL = 'spell-train-bonus-roll',
  AUTO_SUCCESS = 'spell-train-auto-success',
  DOUBLE_TRAIN = 'spell-train-double-train',
}

export interface SpellTrainData {
  category?: WitchPredilectionsNameEnum;
  spellId?: string;
  group?: TrainGroupOption;
  playerId?: string;
  autoSuccess?: number;
  bonusRoll?: number;
  doubleTrain?: boolean;
}

@Group({
  name: 'maestria',
  description: 'Veja as maestrias adquiridas',
})
@Injectable()
export class TrainGroup {
  constructor(
    private readonly trainService: TrainService,
    private readonly trainSpellService: TrainSpellService,
    private readonly spellService: SpellService,
    private readonly rollService: RollService,
  ) {}

  async execute() {}

  @Command({
    name: 'feiticos',
    description: 'Verifica todos os status de maestria que você possui',
  })
  async spellsTrains(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgPlayer() player: Player,
  ) {
    const trains = await this.trainService.findAll({
      where: {
        playerId: player.id,
        spellId: Not(IsNull()),
      },
      relations: {
        spell: true,
      },
    });

    const groupedTrains = groupBy(trains, (train) => train.spellId);

    const xpTotalsBySpell: { [key: string]: number } = {};
    for (const spellId in groupedTrains) {
      xpTotalsBySpell[spellId] = sumBy(groupedTrains[spellId], 'xp');
    }

    // Sort the spells based on total XP
    const sortedSpells = Object.entries(xpTotalsBySpell).sort(
      ([, a], [, b]) => b - a,
    );

    const helper = new PaginationHelper({
      items: sortedSpells,
      formatter: async ([spellId, totalXP]) => {
        const spell = groupedTrains[spellId][0].spell;
        const { necessaryXP } = await this.trainSpellService.progressData({
          spell,
          trains,
        });
        const currentLevel = Math.ceil(totalXP / necessaryXP);
        const xpTowardsNextLevel = totalXP % necessaryXP;
        const progressBar = this.generateProgressBarEmoji(
          xpTowardsNextLevel,
          necessaryXP,
        );

        let response = `**${spell.name}**\n`;
        response += `Nível atual: ${currentLevel}\n`;
        response += `XP ${progressBar} ${xpTowardsNextLevel}/${necessaryXP}\n`;
        response += '---'; // Horizontal line for separation
        return response;
      },
      header: '**Spells by Mastery:**\n\n',
    });

    await helper.reply(interaction);
  }

  generateProgressBarEmoji(
    currentXP: number,
    totalXP: number,
    length: number = 10,
  ): string {
    const filledBlocks = Math.round((currentXP / totalXP) * length);
    const emptyBlocks = length - filledBlocks;

    return '▮'.repeat(filledBlocks) + '▯'.repeat(emptyBlocks);
  }

  @Command({
    name: 'pts_feitico',
    description: 'Adiciona pontos de maestria diretamente a um jogador',
    mod: true,
  })
  async addSpellXP(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgPlayer()
    author: Player,
    @ArgPlayer({
      name: 'Jogador',
      description: 'Jogador a receber os pontos de maestria',
    })
    target: Player,
    @ArgGuild()
    guild: Guild,
    @ArgInteger({
      name: 'Quantidade',
      description: 'Quantidade de pontos de maestria a serem adicionados',
    })
    amount: number,
    @ArgString({
      name: 'Feitiço',
      description: 'Nome do feitiço a receber os pontos de maestria',
    })
    spellName: string,
  ) {
    const spell = await this.spellService.findOne({
      where: {
        name: ILike(spellName),
        guildId: guild.id,
      },
    });
    if (!spell) {
      throw new DiscordSimpleError('Feitiço não encontrado');
    }
    const train = await this.trainService.create({
      player: target,
      playerId: target.id,
      channelId: interaction.channelId,
      spell: spell,
      spellId: spell.id,
      xp: amount,
      success: 0,
      group: TrainGroupOption.PROFESSOR,
    });
    await interaction.reply({
      content: `Adicionado ${amount} pontos de maestria ao feitiço ${
        spell.name
      }, para o jogador ${target.name || `'Sem Nome' Use /pj atualizar`}`,
    });
    if (!guild.trainLogChannel) return;
    await guild.trainLogChannel.send({
      content:
        `<@${author.discordId}> entregou ${amount} pontos do feitiço ${spell.name} para <@${target.discordId}>` +
        `\nID para cancelar: ${train.id}`,
    });
  }

  @Command({
    name: 'cancelar_treino_feitico',
    description: 'Cancela o acontecimento de algum treino de jogador',
    mod: true,
  })
  async cancelSpellXP(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgGuild()
    guild: Guild,
    @ArgString({
      name: 'ID',
      description: 'Id de cancelamento informado no log',
    })
    id: string,
  ) {
    const train = await this.trainService.findOne({
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
    if (!train) {
      throw new DiscordSimpleError('Treino não encontrado');
    }

    const removed = await this.trainService.remove({
      id: train.id,
    });
    await interaction.reply({
      content: `${removed.affected} treino cancelado...`,
      embeds: [train.toEmbed()],
      ephemeral: true,
    });
    if (!guild.trainLogChannel) return;
    await guild.trainLogChannel.send({
      content: `Treino de <@${train.player.discordId}> cancelado por <@${interaction.user.id}>`,
      embeds: [train.toEmbed()],
    });
  }

  // #endregion
}
