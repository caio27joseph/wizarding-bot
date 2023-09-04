import { Injectable } from '@nestjs/common';
import {
  AttachmentBuilder,
  ButtonStyle,
  EmbedBuilder,
  InteractionReplyOptions,
} from 'discord.js';
import { TrainSpellService } from './train-spell.service';
import { Train, TrainGroupOption } from './entities/train.entity';
import { Spell, maestryNumToName } from '~/spell/entities/spell.entity';
import {
  MagicSchoolDisplayEnum,
  MagicSchoolKeys,
  magicSchoolDisplayToKeyMap,
  magicSchoolKeyToDisplayMap,
} from '~/player-system/witch-predilection/entities/witch-predilection.entity';
import { Player } from '~/core/player/entities/player.entity';
import {
  ActionContext,
  MenuAction,
  MenuHelper,
} from '~/discord/helpers/menu-helper';
import { ButtonConfig, FormHelper } from '~/discord/helpers/form-helper';
import { RollService } from '~/roll/roll.service';
import { RollsD10 } from '~/roll/entities/roll.entity';
import { TrainService } from './train.service';
import { SpellActionContext } from '~/spell/spell.menu.group';
import { DiscordSimpleError } from '~/discord/exceptions';
import { GrimoireService } from '~/grimoire/grimoire.service';

interface Props {
  roll?: MagicSchoolDisplayEnum;
  spell?: Spell;
  group?: TrainGroupOption;
  player?: Player;
  autoSuccess?: number;
  bonusRoll?: number;
}

export interface TrainSpellActionContext extends SpellActionContext {
  trains?: Train[];
  todayTrains?: Train[];
  spellTrains?: Train[];
}

@Injectable()
export class TrainSpellMenu extends MenuHelper<TrainSpellActionContext> {
  constructor(
    private readonly trainSpellService: TrainSpellService,
    private readonly trainService: TrainService,
    private readonly rollService: RollService,
    private readonly grimoireService: GrimoireService,
  ) {
    super();
  }

  async buildUpContext(
    context: SpellActionContext,
  ): Promise<TrainSpellActionContext> {
    const todayTrains = await this.trainSpellService.getTodayTrains(
      context.player.id,
    );
    const trains = await this.trainService.findAll({
      where: {
        playerId: context.player.id,
      },
    });
    const grimoire =
      (await context.grimoire) ||
      (await this.grimoireService.getOrCreate(
        {
          where: {
            playerId: context.player.id,
          },
        },
        {
          player: context.player,
        },
      ));

    const spellTrains = trains.filter((t) => t.spellId === context.spell.id);
    const newContext: TrainSpellActionContext = {
      ...context,
      todayTrains,
      trains,
      spellTrains,
      grimoire,
    };
    return newContext;
  }

  async getMenuPrompt(context: TrainSpellActionContext) {
    const { spellTrains: trains } = context;
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
    const { spell, todayTrains, grimoire } = context;
    try {
      await this.trainSpellService.validate({
        spell,
        todayTrains,
      });
    } catch (e) {
      await context.interaction.followUp({
        content: e.message,
      });
      return;
    }

    if (!grimoire.spells.some((s) => s.id === spell.id)) {
      return await context.interaction.followUp(
        'Você não conhece esse feitiço, use /grimorio aprender',
      );
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
          await this.cancelTrain(context);
        },
      },
      {
        label: 'Treinar',
        style: ButtonStyle.Primary,
        handler: async (i, props) => {
          await this.startTrain(context, props);
        },
      },
    ];

    if (canDoubleTrain) {
      buttons.push({
        label: 'Treinar x2',
        style: ButtonStyle.Secondary,
        handler: async (i, props) => {
          await this.startTrain(context, props, canDoubleTrain);
        },
      });
    }

    await new FormHelper<Props>(context, {
      label: `Treinar ${context.spell.name} ${
        context.spell.category.length === 1
          ? `\n> Controle + ${context.spell.category[0]}`
          : ''
      }`,
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
          disabled: context.spell.category.length === 1,
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
    await context.interaction.followUp({
      content: 'Treino Cancelado',
      ephemeral: true,
    });
  }
  async startTrain(
    context: TrainSpellActionContext,
    props: Props,
    doubleTrain?: boolean,
  ) {
    await context.interaction.followUp({
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
      filter: (m) => m.author.id === context.interaction.user.id,
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
    const roll = await this.rollService.roll10(interaction, player, {
      magicSchool: magicSchoolDisplayToKeyMap[props.roll] as MagicSchoolKeys,
      extras: 'control',
      autoSuccess: props.autoSuccess,
      bonus: props.bonusRoll,
      message: spell.name,
    });
    rolls.push(roll);
    if (doubleTrain) {
      const roll = await this.rollService.roll10(interaction, player, {
        magicSchool: magicSchoolDisplayToKeyMap[props.roll],
        extras: 'control',
        autoSuccess: props.autoSuccess,
        bonus: props.bonusRoll,
        message: spell.name,
      });
      rolls.push(roll);
    }
    // total should be the total sum of rolls array
    const train = await this.trainService.create({
      success: rolls.reduce((acc, curr) => acc + curr.total, 0),
      channelId: interaction.channelId,
      messageId: message.id,
      spell: spell,
      spellId: spell.id,
      player: player,
      playerId: player.id,
      group: props.group,
      double: doubleTrain,
    });

    context.spellTrains.push(train);
    await message.reply({
      content: train.toShortText(),
      embeds: rolls.map((r) => r.toEmbed()),
    });

    if (context.interaction.isRepliable()) {
      const progress = await this.getMenuPrompt(context);
      (progress as InteractionReplyOptions).ephemeral = true;
      await context.interaction.followUp(progress);
    }

    if (!guild.trainLogChannel) {
      return;
    }

    await guild.trainLogChannel.send({
      content:
        `<@${player.discordId}> realizou um treino de ${spell.name}, Ação: ` +
        `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}` +
        `\nID: ${train.id}`,
      embeds: [train.toEmbed()],
    });
  }
}
