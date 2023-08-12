import { Injectable } from '@nestjs/common';
import { Group } from '~/discord/decorators/group.decorator';
import { TrainService } from './train.service';
import { Command } from '~/discord/decorators/command.decorator';
import { ArgInteraction } from '~/discord/decorators/message.decorators';
import {
  APISelectMenuOption,
  ActionRowBuilder,
  AnySelectMenuInteraction,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  Interaction,
  InteractionResponse,
  MessageComponentInteraction,
  ModalBuilder,
  StringSelectMenuInteraction,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { StringSelectMenuBuilder } from '@discordjs/builders';
import { PlayerService } from '~/core/player/player.service';
import { Player } from '~/core/player/entities/player.entity';
import { Spell } from '~/spell/entities/spell.entity';
import { Rolls10Group } from '~/roll/rolls10.group';
import { RollService } from '~/roll/roll.service';
import {
  WitchPredilectionsNameEnum,
  witchPredilectionsNameMap,
} from '~/player-system/witch-predilection/entities/witch-predilection.entity';
import { TrainGroupOption } from './entities/train.entity';
import { MoreThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export enum SpellTrainAction {
  SELECT_GROUP = 'spell-train-group-select',
  SELECT_ROLL = 'spell-train-tests-select',
  SUBMIT = 'spell-train-submit',
  BONUS_ROLL = 'spell-train-bonus-roll',
  AUTO_SUCCESS = 'spell-train-auto-success',
}

export interface SpellTrainData {
  category?: WitchPredilectionsNameEnum;
  spellId?: string;
  group?: TrainGroupOption;
  playerId?: string;
  autoSuccess?: number;
  bonusRoll?: number;
}

@Group({
  name: 'treinar',
  description: 'Inicia um treino de habilidade',
})
@Injectable()
export class TrainGroup {
  constructor(
    private readonly trainService: TrainService,
    private readonly playerService: PlayerService,
    private readonly rollService: RollService,
  ) {}

  async handlePossibleSpellTrain(
    interaction: CommandInteraction,
    i: MessageComponentInteraction,
    player: Player,
    spell: Spell,
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

    const trains = await this.trainService.findAll({
      where: {
        playerId: player.id,
        createdAt: MoreThan(startTime),
      },
    });
    if (trains.length >= 6) {
      await i.reply({
        content: `Você já treinou mais do que poderia hoje!`,
        ephemeral: true,
      });
      return;
    }
    const trainingForThisSpell = trains.filter((t) => t.spellId);
    if (trainingForThisSpell.length >= 2) {
      await i.reply({
        content: `Você já treinou mais do que poderia hoje!`,
        ephemeral: true,
      });
      return;
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
      components: this.spellTrainMenu(tests, submitHash),
    });

    const trainOptions: SpellTrainData = {
      spellId: spell.id,
      playerId: player.id,
      group: TrainGroupOption.SOLO,
      category: spell.category[0] as WitchPredilectionsNameEnum,
      autoSuccess: 0,
      bonusRoll: 0,
    };
    const filter = (i) => {
      return i.user.id === player.discordId;
    };
    const configurator = reply.createMessageComponentCollector({
      filter,
      time: 1000 * 60 * 10,
    });
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
          await reply.edit({
            content:
              `Treino de ${spell.name} Configurado!` +
              '\nEnvie sua ação de treino por favor (5 Minutos)',
            components: [],
          });
          await this.startSpellTrain(interaction, player, spell, trainOptions);
          configurator.stop();
          break;
      }
    });
  }
  async startSpellTrain(
    interaction: CommandInteraction,
    player: Player,
    spell: Spell,
    options: SpellTrainData,
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

    const roll = await this.rollService.roll10(player, {
      witchPredilection: witchPredilectionsNameMap[options.category],
      extras: 'control',
      autoSuccess: options.autoSuccess,
      bonus: options.bonusRoll,
    });
    await message.reply({
      embeds: [roll.toEmbed()],
    });

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
      content: `Treino Feito!`,
      embeds: [train.toEmbed()],
    });
  }

  spellTrainMenu(tests: { [category: string]: string }, id) {
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
    const numberOptions = [0, 1, 2, 3, 4, 5, 6].map((n) => ({
      label: n.toString(),
      value: n.toString(),
    }));
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

    const submit = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder({
        customId: SpellTrainAction.SUBMIT + id,
        label: 'Treinar',
        style: ButtonStyle.Success,
      }),
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
}
