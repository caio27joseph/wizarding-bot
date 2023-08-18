import { Injectable } from '@nestjs/common';
import { Guild } from '~/core/guild/guild.entity';
import { Command } from '~/discord/decorators/command.decorator';
import { Group } from '~/discord/decorators/group.decorator';
import {
  ArgGuild,
  ArgInteger,
  ArgInteraction,
  ArgPlayer,
  ArgString,
} from '~/discord/decorators/message.decorators';
import { SpellService } from './spell.service';
import {
  ActionRowBuilder,
  AnySelectMenuInteraction,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CacheType,
  CommandInteraction,
  InteractionResponse,
  Message,
  MessageComponentInteraction,
  StringSelectMenuInteraction,
} from 'discord.js';
import { Spell, SpellCategoryEnum } from './entities/spell.entity';
import { Any, ILike, In } from 'typeorm';
import { EntityNotFound } from '~/discord/exceptions';
import { SpellTrainAction, TrainGroup } from '~/train/train.group';
import { PlayerService } from '~/core/player/player.service';
import { Player } from '~/core/player/entities/player.entity';
import { v4 as uuidv4 } from 'uuid';
import { GrimoireMenu } from '~/grimoire/grimoire.menu';
import { TrainSpellMenu } from '~/train/train-spell.menu';
import { MenuAction, ActionContext } from '~/discord/helpers/menu-helper';

enum SpellActions {
  MAESTRY = 'maestry',
  GRIMOIRE = 'grimoire',
}

export interface SpellActionContext extends ActionContext {
  spell?: Spell;
  spells?: Spell[];
}

@Injectable()
@Group({
  name: 'spell',
  description: 'Comandos relacionados a feitiços',
})
export class SpellGroup {
  constructor(
    private readonly service: SpellService,
    private readonly trainSpellMenu: TrainSpellMenu,
    private readonly grimoireMenu: GrimoireMenu,
    private readonly playerService: PlayerService,
  ) {}

  actions(options: ActionMenuOptions) {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(SpellActions.MAESTRY + options.hash)
        .setLabel('Maestria')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(options.disabled),
      // new ButtonBuilder()
      //   .setCustomId(SpellActions.GRIMOIRE + options.hash)
      //   .setLabel('Grimório')
      //   .setStyle(ButtonStyle.Primary)
      //   .setDisabled(options.disabled),
    );
  }
  // async handleActions(context: SpellActionContext) {
  //   const { player, spell, guild, interaction, response } = context;

  //   const collector = response.createMessageComponentCollector({
  //     filter: (i) => player.discordId === interaction.user.id,
  //     time: 20000,
  //   });
  //   let responded = false;
  //   collector.on('collect', async (i) => {
  //     if (responded) return;
  //     context.i = i as ButtonInteraction<CacheType>;
  //     switch (i.customId) {
  //       case SpellActions.MAESTRY + hash:
  //         await this.trainSpellMenu.handle({
  //           i: i as ButtonInteraction<CacheType>,
  //           ...context,
  //         });
  //         await response.delete();
  //         break;
  //       case SpellActions.GRIMOIRE + hash:
  //         await this.grimoireMenu.handle(context);
  //         await response.delete();
  //         break;
  //     }
  //     responded = true;
  //   });
  // }

  @Command({
    name: 'add',
    description: 'Adiciona um feitiço',
    mod: true,
  })
  addSpell(@ArgGuild() guild: Guild) {}

  @Command({
    name: 'set',
    description: 'Atualiza um feitiço',
    mod: true,
  })
  setSpell() {}

  @Command({
    name: 'ver',
    description: 'Pega informações de um feitiço',
  })
  async getSpell(
    @ArgInteraction() interaction: CommandInteraction,
    @ArgGuild() guild: Guild,
    @ArgString({
      name: 'Nome',
      description: 'Nome do feitiço, ex.: "Lumos"',
    })
    name: string,
    @ArgPlayer()
    player: Player,
  ) {
    const spell = await this.service.findOne({
      where: { guildId: guild.id, name: ILike(name) },
    });
    if (!spell) throw new EntityNotFound('Feitiço', name);

    const response = await interaction.reply({
      embeds: [spell.toEmbed()],
      components: [
        new ActionRowBuilder<ButtonBuilder>().setComponents(
          new ButtonBuilder()
            .setCustomId('depreceated')
            .setLabel('Maestria(Removido) (Use o comando /ftc nome:feitico)')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true),
        ),
      ],
      ephemeral: true,
    });

    // await this.handleActions({
    //   guild,
    //   player,
    //   spell,
    //   interaction,
    //   response,
    // });
  }

  @Command({
    name: 'todos',
    description: 'Lista os feiticos um feitiço',
  })
  async listSpells(
    @ArgGuild() guild: Guild,
    @ArgInteraction() interaction: CommandInteraction,
    @ArgInteger({
      name: 'Ano',
      description: 'Ano do feitiço, 1... 2',
      required: false,
    })
    level?: number,
    @ArgString({
      name: 'Categoria',
      description: 'Categoria do feitiço',
      required: false,
      choices: Object.values(SpellCategoryEnum),
    })
    category?: SpellCategoryEnum,
  ) {
    const ITEMS_PER_PAGE = 8;

    let spells = await this.service.findAll({
      where: {
        level,
        guildId: guild.id,
      },
    });
    if (category) {
      spells = spells.filter((spell) => spell.category.includes(category));
    }

    const totalPages = Math.ceil(spells.length / ITEMS_PER_PAGE);

    let currentPage = 0;

    let currentSpellResponse: InteractionResponse;

    const createSpellButtons = (page: number) => {
      const start = page * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const currentSpells = spells.slice(start, end);

      const buttons = currentSpells.map((spell) =>
        new ButtonBuilder()
          .setCustomId(`spell_${spell.id}`)
          .setLabel(spell.name)
          .setStyle(ButtonStyle.Primary),
      );

      const rows = [];
      if (buttons.length > 5) {
        rows.push(buttons.slice(0, 5)); // First 5 buttons
        rows.push(buttons.slice(5)); // Remaining buttons
      } else {
        rows.push(buttons);
      }

      return rows.map(
        (buttonSet) =>
          new ActionRowBuilder<ButtonBuilder>({ components: buttonSet }),
      );
    };

    const createNavigationRow = () => {
      return new ActionRowBuilder<ButtonBuilder>({
        components: [
          new ButtonBuilder()
            .setCustomId('previous')
            .setLabel('⬅️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === 0),
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('➡️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === totalPages - 1),
        ],
      });
    };
    const displaySpellsForPage = (page: number) => {
      const start = page * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const currentSpells = spells.slice(start, end);
      return currentSpells.map((spell) => spell.toShortText()).join('\n');
    };
    const spellButtonRows = createSpellButtons(currentPage);

    const message = await interaction.reply({
      content: `Use o comando /ftc!\nFeitiços (Page ${
        currentPage + 1
      } of ${totalPages}):\n${displaySpellsForPage(currentPage)}`,
      components: [...spellButtonRows, createNavigationRow()],
      ephemeral: true,
    });

    const collector = message.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: 60000,
    });

    collector.on('collect', async (i) => {
      if (i.customId.startsWith('spell_')) {
        // Here you can handle specific spell button clicks, like showing more information
        // about the clicked spell.
        const spellId = i.customId.split('_')[1];
        const selectedSpell = spells.find((spell) => spell.id === spellId);
        if (selectedSpell) {
          // Do something with the selected spell, e.g., display more details.

          const newSpell = await i.reply({
            embeds: [selectedSpell.toEmbed()],
            ephemeral: true,
          });
          if (currentSpellResponse) {
            await currentSpellResponse.delete();
          }
          currentSpellResponse = newSpell;
          return;
        }
      }

      if (i.customId === 'previous' && currentPage > 0) {
        currentPage--;
      } else if (i.customId === 'next' && currentPage < totalPages - 1) {
        currentPage++;
      }

      const spellButtonRows = createSpellButtons(currentPage);

      await i.update({
        content: `Feitiços (Page ${
          currentPage + 1
        } of ${totalPages}):\n${displaySpellsForPage(currentPage)}`,
        components: [...spellButtonRows, createNavigationRow()],
      });
      return; // Ensure that you're returning void
    });

    collector.on('end', () => {
      const disabledButtonsRow = new ActionRowBuilder<ButtonBuilder>({
        components: [
          new ButtonBuilder()
            .setCustomId('previous')
            .setLabel('⬅️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('➡️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true),
        ],
      });

      const disabledSpellButtonRows = createSpellButtons(currentPage).map(
        (row) =>
          new ActionRowBuilder<ButtonBuilder>({
            components: row.components.map((button) =>
              button.setDisabled(true),
            ),
          }),
      );

      message.edit({
        content: `Feitiços (Page ${
          currentPage + 1
        } of ${totalPages}):\n${displaySpellsForPage(currentPage)}`,
        components: [...disabledSpellButtonRows, disabledButtonsRow],
      });
    });
  }
}
