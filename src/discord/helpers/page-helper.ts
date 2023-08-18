import {
  Message,
  MessageReaction,
  User,
  TextChannel,
  CommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
} from 'discord.js';

type FormatterFunction<T> = (
  item: T,
  index: number,
  array: T[],
) => Promise<string>;

export interface PageHelperOptions<T> {
  items: T[];
  itemsPerPage?: number;
  formatter: FormatterFunction<T>;
  header?: string;
  footer?: (currentPage: number, totalPages: number) => string;
}

export class PaginationHelper<T> {
  private readonly items: T[];
  private readonly itemsPerPage: number;
  private readonly formatter: FormatterFunction<T>;
  private readonly header: string;
  private readonly footer: (currentPage: number, totalPages: number) => string;
  private currentPage: number = 1;

  constructor(options: PageHelperOptions<T>) {
    this.items = options.items;
    this.itemsPerPage = options.itemsPerPage || 10;
    this.itemsPerPage++;
    this.formatter = options.formatter;
    this.header = options.header || '';
    this.footer =
      options.footer ||
      ((currentPage, totalPages) => `Page ${currentPage} of ${totalPages}`);
  }

  async send(channel: TextChannel): Promise<void> {
    const totalPages: number = Math.ceil(this.items.length / this.itemsPerPage);

    const constructPage = (page: number): string => {
      const start: number = (page - 1) * this.itemsPerPage;
      const end: number = start + this.itemsPerPage;
      const pageItems = this.items.slice(start, end);

      let content: string = this.header;
      content += pageItems.map(this.formatter).join('\n');
      content += this.footer(page, totalPages);

      return content;
    };

    const initialContent: string = constructPage(this.currentPage);
    const message: Message = await channel.send(initialContent);

    if (totalPages > 1) {
      await message.react('◀️');
      await message.react('▶️');

      const filter = (reaction: MessageReaction, user: User) => {
        return ['◀️', '▶️'].includes(reaction.emoji.name) && !user.bot;
      };

      const collector = message.createReactionCollector({
        filter,
        time: 120000,
      });

      collector.on('collect', (reaction: MessageReaction, user: User) => {
        if (reaction.emoji.name === '▶️' && this.currentPage < totalPages) {
          this.currentPage++;
        } else if (reaction.emoji.name === '◀️' && this.currentPage > 1) {
          this.currentPage--;
        }

        const newContent: string = constructPage(this.currentPage);
        message.edit(newContent);

        reaction.users.remove(user.id);
      });

      collector.on('end', () => {
        message.reactions.removeAll();
      });
    }
  }
  async reply(interaction: CommandInteraction): Promise<void> {
    const totalPages: number = Math.ceil(this.items.length / this.itemsPerPage);

    const constructPage = async (page: number): Promise<string> => {
      const start: number = (page - 1) * this.itemsPerPage;
      const end: number = start + this.itemsPerPage;
      const pageItems = this.items.slice(start, end);

      let content: string = this.header;
      content += await (
        await Promise.all(pageItems.map(this.formatter))
      ).join('\n');
      content += this.footer(page, totalPages);

      return content;
    };

    const initialContent: string = await constructPage(this.currentPage);
    const message = await interaction.reply({
      content: initialContent,
      ephemeral: true,
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId('previous')
            .setLabel('◀️')
            .setDisabled(this.currentPage === 1)
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('▶️')
            .setDisabled(this.currentPage === totalPages)
            .setStyle(ButtonStyle.Primary),
        ),
      ],
    });

    const filter = (i: ButtonInteraction) => {
      return (
        ['previous', 'next'].includes(i.customId) &&
        i.user.id === interaction.user.id
      );
    };

    const collector = message.createMessageComponentCollector({
      filter,
      time: 120000,
    });

    collector.on('collect', async (i: ButtonInteraction) => {
      if (i.customId === 'next' && this.currentPage < totalPages) {
        this.currentPage++;
      } else if (i.customId === 'previous' && this.currentPage > 1) {
        this.currentPage--;
      }

      const newContent: string = await constructPage(this.currentPage);
      await i.update({
        content: newContent,
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId('previous')
              .setLabel('◀️')
              .setDisabled(this.currentPage === 1)
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId('next')
              .setLabel('▶️')
              .setDisabled(this.currentPage === totalPages)
              .setStyle(ButtonStyle.Primary),
          ),
        ],
      });
    });
    collector.on('end', () => {
      message.edit({
        components: [],
      });
    });
    return;
  }
  async followUp(interaction: CommandInteraction): Promise<void> {
    const totalPages: number = Math.ceil(this.items.length / this.itemsPerPage);

    const constructPage = async (page: number): Promise<string> => {
      const start: number = (page - 1) * this.itemsPerPage;
      const end: number = start + this.itemsPerPage;
      const pageItems = this.items.slice(start, end);

      let content: string = this.header;
      content += await (
        await Promise.all(pageItems.map(this.formatter))
      ).join('\n');
      content += this.footer(page, totalPages);

      return content;
    };

    const initialContent: string = await constructPage(this.currentPage);
    const message = await interaction.followUp({
      content: initialContent,
      ephemeral: true,
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId('previous')
            .setLabel('◀️')
            .setDisabled(this.currentPage === 1)
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('▶️')
            .setDisabled(this.currentPage === totalPages)
            .setStyle(ButtonStyle.Primary),
        ),
      ],
    });

    const filter = (i: ButtonInteraction) => {
      return (
        ['previous', 'next'].includes(i.customId) &&
        i.user.id === interaction.user.id
      );
    };

    const collector = message.createMessageComponentCollector({
      filter,
      time: 120000,
    });

    collector.on('collect', async (i: ButtonInteraction) => {
      if (i.customId === 'next' && this.currentPage < totalPages) {
        this.currentPage++;
      } else if (i.customId === 'previous' && this.currentPage > 1) {
        this.currentPage--;
      }

      const newContent: string = await constructPage(this.currentPage);
      await i.update({
        content: newContent,
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId('previous')
              .setLabel('◀️')
              .setDisabled(this.currentPage === 1)
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId('next')
              .setLabel('▶️')
              .setDisabled(this.currentPage === totalPages)
              .setStyle(ButtonStyle.Primary),
          ),
        ],
      });
    });
    collector.on('end', () => {
      message.edit({
        components: [],
      });
    });
    return;
  }
}
