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

  private async constructPage(page: number): Promise<string> {
    const start: number = (page - 1) * this.itemsPerPage;
    const end: number = start + this.itemsPerPage;
    const pageItems = this.items.slice(start, end);

    let content: string = this.header + '\n';
    content += await Promise.all(pageItems.map(this.formatter)).then((items) =>
      items.join('\n'),
    );
    content += '\n' + this.footer(page, this.totalPages);

    return content;
  }

  private get totalPages(): number {
    return Math.ceil(this.items.length / this.itemsPerPage);
  }

  private getActionRowComponents(): any {
    return [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('previous')
          .setLabel('◀️')
          .setDisabled(this.currentPage === 1)
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('▶️')
          .setDisabled(this.currentPage === this.totalPages)
          .setStyle(ButtonStyle.Primary),
      ),
    ];
  }

  private handleButtonInteraction(i: ButtonInteraction): void {
    if (i.customId === 'next' && this.currentPage < this.totalPages) {
      this.currentPage++;
    } else if (i.customId === 'previous' && this.currentPage > 1) {
      this.currentPage--;
    }
  }

  async reply(interaction: CommandInteraction): Promise<void> {
    const initialContent = await this.constructPage(this.currentPage);
    const message = await interaction.reply({
      content: initialContent,
      ephemeral: true,
      components: this.getActionRowComponents(),
    });

    this.setupCollector(message, interaction);
  }

  async followUp(interaction: CommandInteraction): Promise<void> {
    const initialContent = await this.constructPage(this.currentPage);
    const message = await interaction.followUp({
      content: initialContent,
      ephemeral: true,
      components: this.getActionRowComponents(),
    });
    this.setupCollector(message, interaction);
  }

  private setupCollector(message: any, interaction: CommandInteraction): void {
    const filter = (i: ButtonInteraction) =>
      ['previous', 'next'].includes(i.customId) &&
      i.user.id === interaction.user.id;

    const collector = message.createMessageComponentCollector({
      filter,
      time: 120000,
    });

    collector.on('collect', async (i: ButtonInteraction) => {
      this.handleButtonInteraction(i);

      const newContent = await this.constructPage(this.currentPage);
      await i.update({
        content: newContent,
        components: this.getActionRowComponents(),
      });
    });

    collector.on('end', () => {
      interaction.editReply({ components: [] });
    });
  }
}
