import { Injectable } from '@nestjs/common';
import {
  APISelectMenuOption,
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CacheType,
  EmbedBuilder,
  Interaction,
  InteractionReplyOptions,
  MessagePayload,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';
import { v4 } from 'uuid';
import { SpellActionContext } from '~/spell/spell.group';
import { TrainSpellService } from './train-spell.service';
import { TrainService } from './train.service';
import { Train, TrainGroupOption } from './entities/train.entity';
import { Spell, maestryNumToName } from '~/spell/entities/spell.entity';
import {
  WitchPredilectionsNameEnum,
  witchPredilectionsNameMap,
} from '~/player-system/witch-predilection/entities/witch-predilection.entity';
import { Player } from '~/core/player/entities/player.entity';
import {
  ActionContext,
  MenuAction,
  MenuHelper,
} from '~/discord/helpers/menu-helper';
import {
  ButtonConfig,
  FormConfig,
  FormHelper,
} from '~/discord/helpers/form-helper';
import { RollService } from '~/roll/roll.service';
import { RollsD10 } from '~/roll/entities/roll.entity';

interface Props {
  roll?: WitchPredilectionsNameEnum;
  spell?: Spell;
  group?: TrainGroupOption;
  player?: Player;
  autoSuccess?: number;
  bonusRoll?: number;
}

export interface TrainSpellActionContext extends SpellActionContext {
  trains?: Train[];
  todayTrains?: Train[];
}

@Injectable()
export class TrainSpellMenu extends MenuHelper<TrainSpellActionContext> {
  constructor(
    private readonly trainSpellService: TrainSpellService,
    private readonly trainService: TrainService,
    private readonly rollService: RollService,
  ) {
    super();
  }
  async buildUpContext(
    context: SpellActionContext,
  ): Promise<TrainSpellActionContext> {
    const todayTrains = await this.trainSpellService.getTodayTrains(
      context.player.id,
    );
    const newContext: TrainSpellActionContext = {
      ...context,
      todayTrains,
    };
    return newContext;
  }

  async getMenuPrompt(
    context: TrainSpellActionContext,
  ): Promise<InteractionReplyOptions> {
    const trains = await this.trainService.findAll({
      where: {
        spellId: context.spell.id,
        playerId: context.player.id,
      },
    });
    const progress = await this.trainSpellService.progressData({
      trains,
      spell: context.spell,
    });
    const embed = new EmbedBuilder().setTitle(
      `:magic_wand: Maestria de ${context.spell.name}`,
    );

    embed.setDescription(
      `***Maestria ${maestryNumToName[progress.currentLevel]}***: ` +
        context.spell.maestry.find((m) => m.level === progress.currentLevel)
          .description,
    );
    embed.setFields(
      {
        name: ':student: Progresso',
        value: `Treinos Totais: ${progress.totalTrains}\nXP Total: ${progress.totalXp}`,
        inline: true,
      },
      {
        name: ':dna: Evolução',
        value: `XP ${progress.xpTowardsNextLevel}/${progress.necessaryXP}`,
        inline: true,
      },
    );
    const buffer = this.trainSpellService.createSpellMasteryImage(
      progress.xpTowardsNextLevel,
      progress.necessaryXP,
    );
    const attachment = new AttachmentBuilder(buffer, {
      name: 'spell-mastery.png',
    });

    embed.setImage('attachment://spell-mastery.png');
    return {
      embeds: [embed],
      files: [attachment],
    };
  }
  // This assumes you have decorators to handle each customId, similar to GrimoireMenu
  @MenuAction('Treinar')
  async train(context: TrainSpellActionContext) {
    const { spell, todayTrains } = context;
    try {
      await this.trainSpellService.validate({
        spell,
        todayTrains,
      });
    } catch (e) {
      await context.i.reply({
        content: e.message,
      });
      return;
    }
    const canDoubleTrain = this.trainSpellService.canDoubleTrain({
      todayTrains,
      spell,
    });
    const buttons: ButtonConfig<Props>[] = [
      {
        label: 'Cancelar',
        style: ButtonStyle.Danger,
        handler: async (i, props) => {
          context.i = i;
          await this.cancelTrain(context);
        },
      },
      {
        label: 'Treinar',
        style: ButtonStyle.Primary,
        handler: async (i, props) => {
          context.i = i;
          await this.startTrain(context, props);
        },
      },
    ];

    if (canDoubleTrain) {
      buttons.push({
        label: 'Treinar x2',
        style: ButtonStyle.Secondary,
        handler: async (i, props) => {
          context.i = i;
          await this.startTrain(context, props, canDoubleTrain);
        },
      });
    }

    new FormHelper<Props>(context, {
      label: `Treinar ${context.spell.name}`,
      buttons,
      fields: [
        {
          placeholder: 'Estilo de Treino (Padrão: Treino Sozinho)',
          propKey: 'group',
          options: [
            {
              label: 'Treino Sozinho',
              value: TrainGroupOption.SOLO,
            },
            {
              label: 'Treino em Dupla',
              value: TrainGroupOption.DUO,
            },
            {
              label: 'Treino em Trio',
              value: TrainGroupOption.TRIO,
            },
            {
              label: 'Treino em Grupo',
              value: TrainGroupOption.GROUP,
            },
            {
              label: 'Treino com Tutor (Monitor / Especialista)',
              value: TrainGroupOption.TUTOR,
            },
            {
              label: 'Treino com Professor',
              value: TrainGroupOption.PROFESSOR,
            },
          ],
          defaultValue: TrainGroupOption.SOLO,
        },
        {
          placeholder: `Rolagens Disponíveis (Padrão: Controle + ${context.spell.category[0]})})`,
          propKey: 'roll',
          options: context.spell.category.map((c) => ({
            label: `Controle + ${c}`,
            value: c,
          })),
          defaultValue: context.spell.category[0],
        },
        {
          placeholder: 'Bônus de Treino (Padrão: 0)',
          propKey: 'bonusRoll',
          defaultValue: 0,
          options: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((n) => ({
            label: n.toString() + ' de Bônus',
            value: n.toString(),
          })),
          pipe: (value) => parseInt(value),
        },
        {
          placeholder: 'Sucessos Automáticos (Padrão: 0)',
          propKey: 'autoSuccess',
          defaultValue: 0,
          options: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((n) => ({
            label: n.toString() + ' Sucesso Automático',
            value: n.toString(),
          })),
          pipe: (value) => parseInt(value),
        },
      ],
    }).init();
    //
  }
  async cancelTrain(context: TrainSpellActionContext) {
    await context.i.followUp({
      content: 'Treino Cancelado',
      ephemeral: true,
    });
  }
  async startTrain(
    context: TrainSpellActionContext,
    props: Props,
    doubleTrain?: boolean,
  ) {
    await context.i.followUp({
      content: 'Envie a ação de treino completar',
      embeds: [
        new EmbedBuilder({
          title: `Treino de ${context.spell.name} configurado\nEscreva CANCELAR para cancelar o treino`,
        }).setFields(
          {
            name: 'Estilo de Treino',
            value: props.group,
            inline: true,
          },
          {
            name: 'Bônus de Treino',
            value: props.bonusRoll.toString(),
            inline: true,
          },
          {
            name: 'Rolagem',
            value: `Controle + ${props.roll}`,
            inline: true,
          },
          {
            name: 'Sucessos Automaticos',
            value: props.autoSuccess.toString(),
            inline: true,
          },
        ),
      ],
      ephemeral: true,
    });
    const { interaction, spell, player, guild } = context;
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
    if (message.content.toLowerCase() === 'cancelar') {
      await this.cancelTrain(context);
      await message.delete();
      return;
    }

    const rolls: RollsD10[] = [];
    const roll = await this.rollService.roll10(player, {
      witchPredilection: witchPredilectionsNameMap[props.roll],
      extras: 'control',
      autoSuccess: props.autoSuccess,
      bonus: props.bonusRoll,
    });
    rolls.push(roll);
    const trains: Train[] = [];
    const train = await this.trainService.create({
      success: roll.total,
      channelId: interaction.channelId,
      messageId: message.id,
      spell: spell,
      spellId: spell.id,
      player: player,
      playerId: player.id,
      group: props.group,
    });
    trains.push(train);
    if (doubleTrain) {
      const roll = await this.rollService.roll10(player, {
        witchPredilection: witchPredilectionsNameMap[props.roll],
        extras: 'control',
        autoSuccess: props.autoSuccess,
        bonus: props.bonusRoll,
        message: spell.name,
      });
      rolls.push(roll);
      const train = await this.trainService.create({
        success: roll.total,
        channelId: interaction.channelId,
        messageId: message.id,
        spell: spell,
        spellId: spell.id,
        player: player,
        playerId: player.id,
        group: props.group,
      });
      trains.push(train);
    }

    await message.reply({
      content: trains.map((t) => t.toShortText()).join('\n\n'),
      embeds: rolls.map((r) => r.toEmbed()),
    });
    if (!guild.trainLogChannel) {
      return;
    }

    await guild.trainLogChannel.send({
      content:
        `<@${player.discordId}> realizou um treino de ${spell.name}, Ação: ` +
        `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}` +
        trains.map((t) => `\nID: ${t.id}`).join(''),
      embeds: trains.map((t) => t.toEmbed()),
    });
  }
}
