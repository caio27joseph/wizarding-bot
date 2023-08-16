import { Injectable } from '@nestjs/common';
import {
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  Interaction,
  InteractionReplyOptions,
} from 'discord.js';
import { Player } from '~/core/player/entities/player.entity';
import { PlayerService } from '~/core/player/player.service';
import {
  DiscordSimpleError,
  EntityAlreadyExists,
  EntityNotFound,
} from '~/discord/exceptions';
import {
  ActionContext,
  MenuAction,
  MenuHelper,
} from '~/discord/helpers/menu-helper';
import {
  PageHelperOptions,
  PaginationHelper,
} from '~/discord/helpers/page-helper';
import { Spell } from '~/spell/entities/spell.entity';
import { SpellSlotsModule } from '~/spell/spell-slots/spell-slots.module';
import { SpellSlotsService } from '~/spell/spell-slots/spell-slots.service';
import { SpellActionContext } from '~/spell/spell.group';
import { SpellService } from '~/spell/spell.service';
import { Grimoire } from './entities/grimoire.entity';
import { GrimoireService } from './grimoire.service';
import { group } from 'console';
import { SpellSlot } from '~/spell/spell-slots/entities/spell-slot.entity';
import {
  FormConfig,
  FormHelper,
  OptionConfig,
} from '~/discord/helpers/form-helper';

interface Props {
  selectedSlot: number;
}

export interface HandleGrimorioActionOptions {
  interaction: CommandInteraction;
}

export interface GrimoireActionContext extends SpellActionContext {
  grimoire: Grimoire;
  playerMaxSlots: number;
  slots: SpellSlot[];
}

@Injectable()
export class GrimoireMenu extends MenuHelper<GrimoireActionContext> {
  constructor(
    private readonly slotService: SpellSlotsService,
    private readonly grimoireService: GrimoireService,
  ) {
    super();
  }

  async buildUpContext(context: SpellActionContext) {
    const { player, spell } = context;
    const grimoire = await this.grimoireService.getOrCreate(
      {
        where: {
          playerId: player.id,
        },
        relations: {
          spells: true,
        },
      },
      {
        playerId: player.id,
      },
    );
    grimoire.spells = grimoire.spells || [];

    const slots = await this.slotService.findAll({
      where: {
        playerId: player.id,
      },
      relations: {
        spell: true,
      },
      order: {
        position: 'ASC',
      },
    });

    const ctx: GrimoireActionContext = {
      ...context,
      grimoire,
      slots,
      playerMaxSlots: await this.slotService.playerMaxSlots(player),
    };
    return ctx;
  }

  async getMenuPrompt(
    context: GrimoireActionContext,
  ): Promise<InteractionReplyOptions> {
    const { spell, player, playerMaxSlots, slots } = context;
    let description = 'Slots Atuais\n';

    for (let i = 0; i < playerMaxSlots; i++) {
      description += `${i + 1} - ${
        slots.find((s) => s.position === i)?.spell?.name || 'Vazio'
      }\n`;
    }

    return {
      embeds: [
        new EmbedBuilder()
          .setTitle(`Feitiço ${spell.name} selecionado.`)
          .setDescription(description),
      ],
    };
  }

  @MenuAction('Listar')
  async grimoire(context: GrimoireActionContext) {
    const { player, grimoire } = context;
    const options: PageHelperOptions<Spell> = {
      items: grimoire.spells || [],
      header: `# Grimório de ${player?.name}\n`,
      formatter: async (item, index, array) => {
        return `## ${index}. **${item.name}**\n`;
      },
      footer(currentPage, totalPages) {
        return `Página ${currentPage} de ${totalPages}`;
      },
    };
    new PaginationHelper(options).reply(context.i as any);
  }

  @MenuAction('Substiruir No Slot')
  async slot(context: GrimoireActionContext) {
    const { slots, player, playerMaxSlots, spell } = context;

    const handler = async (interaction: ButtonInteraction, props: Props) => {
      const { selectedSlot } = props;
      let slot = slots.find((s) => s.position === selectedSlot);
      const index = slots.indexOf(slot);
      if (slot) {
        slot.spell = spell;
        slot = await this.slotService.save(slot);
      } else {
        slot = await this.slotService.create({
          playerId: player.id,
          spellId: spell.id,
          position: selectedSlot,
        });
      }
      slots[index] = slot;

      await interaction.followUp({
        content:
          `Salvo ${slot.position + 1}\n` +
          this.slotService.listSlots(slots, playerMaxSlots),
        ephemeral: true,
      });
    };

    let description = 'Slots Atuais\n';
    const options: OptionConfig[] = [];
    for (let i = 0; i < playerMaxSlots; i++) {
      const msg = `${i + 1} - ${
        slots.find((s) => s.position === i)?.spell?.name || 'Vazio'
      }\n`;
      description += msg;
      options.push({
        label: msg,
        value: i.toString(),
      });
    }

    const config: FormConfig<Props> = {
      label: 'Selecione o slot\n' + description,
      fields: [
        {
          placeholder: 'Selecione o slot',
          propKey: 'selectedSlot',
          pipe: (value) => parseInt(value),
          options,
        },
      ],
      buttons: [
        {
          label: 'Substituir',
          style: ButtonStyle.Primary,
          handler,
        },
      ],
    };
    new FormHelper<Props>(context, config).init();
  }
  @MenuAction('Desaprender')
  async removeFromGrimoire(context: GrimoireActionContext) {
    const { spell, grimoire } = context;
    const index = grimoire.spells?.findIndex((s) => s.id === spell.id);

    if (index !== undefined && index !== -1) {
      grimoire.spells.splice(index, 1);
    } else {
      throw new DiscordSimpleError('O feitiço não está no seu grimório.');
    }
    await this.grimoireService.save(grimoire);

    context.i.reply({
      content: 'Grimório Atualizado',
      ephemeral: true,
    });
  }

  @MenuAction('Aprender')
  async addToGrimoire(context: GrimoireActionContext) {
    const { spell, grimoire } = context;

    const found = grimoire.spells?.find((s) => s.id === spell.id);
    if (found) {
      throw new DiscordSimpleError('O feitiço já está no seu grimório.');
    }
    grimoire.spells.push(spell);
    await this.grimoireService.save(grimoire);

    context.i.reply({
      content: 'Grimório Atualizado',
      ephemeral: true,
    });
  }
}
