import { Injectable } from '@nestjs/common';
import { Group } from '~/discord/decorators/group.decorator';
import { CommandInteraction } from 'discord.js';
import { Player } from '~/core/player/entities/player.entity';
import { RollService } from '~/roll/roll.service';
import { WitchPredilectionNameEnum } from '~/player-system/witch-predilection/entities/witch-predilection.entity';
import { TrainGroupOption } from './entities/train.entity';
import { ILike } from 'typeorm';
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
import { PaginationHelper } from '~/discord/helpers/page-helper';
import { SpellService } from '~/spell/spell.service';
import { DiscordSimpleError } from '~/discord/exceptions';
import { TrainSpellService } from './train-spell.service';
import { TrainSpellMenu } from './train-spell.menu';
import { TrainService } from './train.service';
import { SpellActionContext } from '~/spell/spell.menu.group';

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
  category?: WitchPredilectionNameEnum;
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
export class MaestryGroup {
  constructor(
    private readonly trainService: TrainService,
    private readonly trainSpellService: TrainSpellService,
    private readonly spellService: SpellService,
  ) {}

  @Command({
    name: 'feiticos',
    description: 'Verifica todos os status de maestria que você possui',
  })
  async spellsTrains(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgPlayer() player: Player,
  ) {
    const trains = await this.trainSpellService.playerTrains(player.id);
    const sortedSpells = this.trainSpellService.getSortedSpellsByXP(trains);

    const helper = new PaginationHelper({
      items: sortedSpells,
      formatter: async ([spellId, totalXP]) => {
        return await this.trainSpellService.formatSpellForDisplay(
          spellId,
          totalXP,
          trains,
        );
      },
      header: '**Spells by Mastery:**\n\n',
    });

    await helper.reply(interaction);
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

@Group({ name: 'treinar', description: 'Treine seus feitiços' })
@Injectable()
export class TrainGroup {
  constructor(
    private readonly spellService: SpellService,
    private readonly trainSpellMenu: TrainSpellMenu,
  ) {}

  @Command({
    name: 'default',
    description: 'Treine sua maestria',
  })
  async train(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgGuild() guild: Guild,
    @ArgPlayer() player: Player,
    @ArgString({
      name: 'Feitiço',
      description: 'Nome do feitiço a ser treinado',
      required: false,
    })
    spellName?: string,
  ) {
    await interaction.deferReply({ ephemeral: true });
    if (spellName) {
      const spell = await this.spellService.findOneOrFail({
        where: {
          guildId: guild.id,
          name: ILike(spellName),
        },
      });

      const context = await this.trainSpellMenu.buildUpContext({
        interaction,
        guild,
        player,
        spell,
      } as SpellActionContext);

      return await this.trainSpellMenu.train(context);
    }
    throw new DiscordSimpleError('Você precisa informar o que vai treinar');
  }
}
