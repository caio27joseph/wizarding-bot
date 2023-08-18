import { Injectable } from '@nestjs/common';
import {
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  Interaction,
  InteractionReplyOptions,
  Message,
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
import { Group } from '~/discord/decorators/group.decorator';
import { Command } from '~/discord/decorators/command.decorator';
import { TrainService } from '~/train/train.service';
import {
  ArgGuild,
  ArgInteraction,
  ArgPlayer,
  ArgString,
} from '~/discord/decorators/message.decorators';
import { Guild } from '~/core/guild/guild.entity';
import { ILike } from 'typeorm';

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

@Group({
  name: 'grimorio',
  description: 'Gerencia o grimório do jogador',
})
@Injectable()
export class GrimoireMenu extends MenuHelper<GrimoireActionContext> {
  constructor(
    private readonly slotService: SpellSlotsService,
    private readonly grimoireService: GrimoireService,
    private readonly spellService: SpellService,
  ) {
    super();
  }

  @Command({
    name: 'menu',
    description: 'Ver o grimório do jogador',
  })
  async getGrimorio(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgPlayer()
    player: Player,
    @ArgGuild()
    guild: Guild,
  ) {
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
    if (!slots.length) {
      throw new DiscordSimpleError(
        'Você precisa ao menos ter algum feitiço em slot para acessar o menu. use o comando /ftc nome:feitico',
      );
    }

    const spellContext: SpellActionContext = {
      guild,
      player,
      interaction,
      spell: slots[0].spell,
    };

    await this.handle(spellContext, true);
  }

  @Command({
    name: 'aprender',
    description: 'Ver o grimório do jogador',
  })
  async addGrimorio(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgPlayer()
    player: Player,
    @ArgGuild()
    guild: Guild,
    @ArgString({
      name: 'nome',
      description: 'Nome do feitiço',
    })
    name: string,
  ) {
    await interaction.deferReply({ ephemeral: true });
    const spell = await this.spellService.findOne({
      where: {
        name: ILike(name),
      },
    });
    const grimoire = await this.grimoireService.getOrCreate(
      {
        where: {
          playerId: player.id,
        },
      },
      {
        player: player,
        playerId: player.id,
      },
    );
    const slots = await this.slotService.findAll({
      where: {
        playerId: player.id,
      },
    });
    const context: GrimoireActionContext = {
      guild,
      player,
      interaction,
      spell,
      grimoire,
      slots,
      playerMaxSlots: await this.slotService.playerMaxSlots(player),
    };

    await this.addToGrimoire(context);
  }

  @Command({
    name: 'desaprender',
    description: 'Ver o grimório do jogador',
  })
  async removeGrimorio(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgPlayer()
    player: Player,
    @ArgGuild()
    guild: Guild,
    @ArgString({
      name: 'nome',
      description: 'Nome do feitiço',
    })
    name: string,
  ) {
    const spell = await this.spellService.findOne({
      where: {
        name: ILike(name),
      },
    });
    const grimoire = await this.grimoireService.getOrCreate(
      {
        where: {
          playerId: player.id,
        },
      },
      {
        player: player,
        playerId: player.id,
      },
    );
    const slots = await this.slotService.findAll({
      where: {
        playerId: player.id,
      },
    });
    const context: GrimoireActionContext = {
      guild,
      player,
      interaction,

      spell,
      grimoire,
      slots,
      playerMaxSlots: await this.slotService.playerMaxSlots(player),
    };

    await this.removeFromGrimoire(context);
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
    new PaginationHelper(options).reply(context.interaction);
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

      await context.interaction.followUp({
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

    return context.interaction.followUp({
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
    // await this.grimoireService.save(grimoire);

    const response = await context.interaction.followUp({
      content: `${spell.name} adicionado ao seu grimório`,
      ephemeral: true,
    });
    await this.handle({
      ...context,
      grimoire,
      response,
    });
  }
}
