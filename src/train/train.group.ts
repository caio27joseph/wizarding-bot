import { Injectable } from '@nestjs/common';
import { Group } from '~/discord/decorators/group.decorator';
import { TrainService } from './train.service';
import {
  APISelectMenuOption,
  ActionRowBuilder,
  Attachment,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
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
import { TrainGroupOption } from './entities/train.entity';
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
    private readonly spellService: SpellService,
    private readonly rollService: RollService,
  ) {}

  // #region Spell
  async handlePossibleSpellTrain(
    interaction: CommandInteraction,
    i: MessageComponentInteraction,
    player: Player,
    spell: Spell,
    guild: Guild,
  ) {
    const now = new Date();
    // Create a date for 6 am today.
    const today6am = new Date(now);
    today6am.setHours(9, 0, 0, 0);

    let startTime: Date;
    if (now < today6am) {
      // If the current time is before 6 am today, set the start time to 6 am the previous day.
      startTime = new Date(today6am.getTime() - 24 * 60 * 60 * 1000); // Subtract 24 hours
    } else {
      startTime = today6am;
    }
    let canDouble = true;
    const trains = await this.trainService.findAll({
      where: {
        playerId: player.id,
        createdAt: MoreThan(startTime),
      },
    });
    if (trains.length >= 50) {
      await i.reply({
        content: `Você já treinou demais hoje!`,
        ephemeral: true,
      });
      return;
    }
    const trainingForThisSpell = trains.filter((t) => t.spellId === spell.id);
    if (trainingForThisSpell.length >= 30) {
      await i.reply({
        content: `Você já treinou demais esse feitiço hoje!`,
        ephemeral: true,
      });
      return;
    }

    if (trainingForThisSpell.length >= 1 || trains.length >= 5) {
      canDouble = false;
    }

    const tests = {};
    for (const category of spell.category) {
      tests[category] = `Controle + ${category}`;
    }
    const submitHash = uuidv4();
    const reply = await i.channel.send({
      content:
        `Iniciando treino de ${spell.name}, por favor configure <@${player.discordId}>!` +
        `\nLembrando que você tem 10 minutos para configurar o treino e enviar a ação!` +
        `\nVocê deve ter configurado seus pontos usando /extras atrualizar, e /pred_bruxa atualizar`,
      components: this.spellTrainMenu(tests, submitHash, canDouble),
    });

    const trainOptions: SpellTrainData = {
      spellId: spell.id,
      playerId: player.id,
      group: TrainGroupOption.SOLO,
      category: spell.category[0] as WitchPredilectionsNameEnum,
      autoSuccess: 0,
      bonusRoll: 0,
      doubleTrain: false,
    };
    const filter = (i) => {
      return i.user.id === player.discordId;
    };
    const configurator = reply.createMessageComponentCollector({
      filter,
      time: 1000 * 60 * 10,
    });
    let message: Message;
    let submitted = false;
    const submit = async (i, trainOptions: SpellTrainData) => {
      try {
        await i.reply({
          content: `Envia a alção para Iniciar o Treino ${
            trainOptions.doubleTrain ? 'x2' : ''
          }!`,
          components: [],
          ephemeral: true,
        });
      } catch {
        message = await i.channel.send({
          content: `Envia a alção para Iniciar o Treino ${
            trainOptions.doubleTrain ? 'x2' : ''
          }!`,
          components: [],
        });
      }
      if (submitted) return;
      submitted = true;
      await this.startSpellTrain(
        interaction,
        player,
        spell,
        guild,
        trainOptions,
        message,
      );
      await reply.delete();
      configurator.stop();
    };
    configurator.on('collect', async (i: StringSelectMenuInteraction) => {
      switch (i.customId) {
        case SpellTrainAction.SELECT_ROLL:
          trainOptions.category = i.values[0] as WitchPredilectionsNameEnum;
          (await i.deferReply()).delete();
          break;

        case SpellTrainAction.SELECT_GROUP:
          trainOptions.group = i.values[0] as TrainGroupOption;
          (await i.deferReply()).delete();
          break;
        case SpellTrainAction.BONUS_ROLL:
          trainOptions.bonusRoll = parseInt(i.values[0]);
          (await i.deferReply()).delete();
          break;
        case SpellTrainAction.AUTO_SUCCESS:
          trainOptions.autoSuccess = parseInt(i.values[0]);
          (await i.deferReply()).delete();
          break;
        case SpellTrainAction.SUBMIT + submitHash:
          await submit(i, trainOptions);
          break;
        case SpellTrainAction.DOUBLE_TRAIN + submitHash:
          trainOptions.doubleTrain = true;
          await submit(i, trainOptions);
      }
    });
  }

  async startSpellTrain(
    interaction: CommandInteraction,
    player: Player,
    spell: Spell,
    guild: Guild,
    options: SpellTrainData,
    possibleMessage: Message,
  ) {
    const collected = await interaction.channel.awaitMessages({
      filter: (m) => m.author.id === player.discordId,
      max: 1,
      time: 1000 * 60 * 10,
    });
    const message = collected.first();
    if (!message) {
      await interaction.channel.send({
        content: `Você não enviou sua ação a tempo!`,
      });
      return;
    }
    if (possibleMessage) {
      await possibleMessage.delete();
    }
    const rolls: RollsD10[] = [];
    const roll = await this.rollService.roll10(player, {
      witchPredilection: witchPredilectionsNameMap[options.category],
      extras: 'control',
      autoSuccess: options.autoSuccess,
      bonus: options.bonusRoll,
    });
    rolls.push(roll);
    if (options.doubleTrain) {
      const roll = await this.rollService.roll10(player, {
        witchPredilection: witchPredilectionsNameMap[options.category],
        extras: 'control',
        autoSuccess: options.autoSuccess,
        bonus: options.bonusRoll,
        message: spell.name,
      });
      rolls.push(roll);
    }
    for (const roll of rolls) {
      const train = await this.trainService.create({
        success: roll.total,
        channelId: interaction.channelId,
        messageId: message.id,
        spell: spell,
        spellId: spell.id,
        player: player,
        playerId: player.id,
        group: options.group,
      });

      await message.reply({
        content: train.toShortText(),
        embeds: [roll.toEmbed()],
      });
      if (!guild.trainLogChannel) {
        return;
      }

      await guild.trainLogChannel.send({
        content:
          `<@${player.discordId}> realizou um treino de ${spell.name}, Ação: ` +
          `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}` +
          `\nID para cancelar: ${train.id}`,
        embeds: [
          train.toEmbed().setFooter({
            text: `ID: ${train.id}`,
          }),
        ],
      });
    }
  }
  spellTrainMenu(tests: { [category: string]: string }, id, canDouble = true) {
    const groupSelect = new StringSelectMenuBuilder()
      .setCustomId(SpellTrainAction.SELECT_GROUP)
      .setPlaceholder('Treinando sozinho?')
      .setOptions(
        {
          label: 'Treinar sozinho',
          value: TrainGroupOption.SOLO,
        },
        {
          label: 'Treinar em dupla',
          value: TrainGroupOption.DUO,
        },
        {
          label: 'Treinar em trio',
          value: TrainGroupOption.TRIO,
        },
        {
          label: 'Treinar com grupo 4+',
          value: TrainGroupOption.GROUP,
        },
        {
          label: 'Treinar com Tutor (Monitor e Especializados)',
          value: TrainGroupOption.TUTOR,
        },
        {
          label: 'Treinar com Professor',
          value: TrainGroupOption.PROFESSOR,
        },
      );
    const numberOptions = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map(
      (n) => ({
        label: n.toString(),
        value: n.toString(),
      }),
    );
    const testsSelect = new StringSelectMenuBuilder()
      .setCustomId(SpellTrainAction.SELECT_ROLL)
      .setPlaceholder('Qual teste?');
    const options: APISelectMenuOption[] = [];
    for (const [category, roll] of Object.entries(tests)) {
      options.push({
        label: roll,
        value: category,
      });
    }
    testsSelect.addOptions(options);

    const bonusDices = new StringSelectMenuBuilder()
      .setCustomId(SpellTrainAction.BONUS_ROLL)
      .setPlaceholder('Bônus de Dados')
      .setOptions(numberOptions);
    const autoSuccess = new StringSelectMenuBuilder()
      .setCustomId(SpellTrainAction.AUTO_SUCCESS)
      .setPlaceholder('Sucessos Automáticos')
      .setOptions(numberOptions);
    const submitButtons = [
      new ButtonBuilder({
        customId: SpellTrainAction.SUBMIT + id,
        label: 'Treinar',
        style: ButtonStyle.Success,
      }),
    ];

    if (canDouble) {
      submitButtons.push(
        new ButtonBuilder({
          customId: SpellTrainAction.DOUBLE_TRAIN + id,
          label: 'Treinar x2',
          style: ButtonStyle.Success,
        }),
      );
    }

    const submit = new ActionRowBuilder<ButtonBuilder>().addComponents(
      submitButtons,
    );
    const menu1 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      groupSelect,
    );
    const menu2 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      testsSelect,
    );
    const menu3 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      bonusDices,
    );
    const menu4 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      autoSuccess,
    );
    return [menu1, menu2, menu3, menu4, submit];
  }
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
        const necessaryXP = await this.trainService.getSpellNecessaryUpXP(
          spell,
        );
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
