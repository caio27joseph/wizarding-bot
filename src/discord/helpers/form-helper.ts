import {
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuInteraction,
  ButtonInteraction,
  CacheType,
  MessagePayload,
} from 'discord.js';
import { v4 as uuidv4 } from 'uuid'; // Ensure you have uuid installed.
import { ActionContext } from './menu-helper';

export type OptionConfig = {
  label: string;
  value: any;
};

export type FormFieldConfig = {
  placeholder: string;
  propKey: string;
  defaultValue?: any;
  pipe?: (value: string) => any;
  options: OptionConfig[];
};

export type FormConfig<P> = {
  label: string;
  fields: FormFieldConfig[];
  buttons: ButtonConfig<P>[]; // Array of button configurations
};

export type ButtonConfig<P> = {
  label: string;
  style: ButtonStyle;
  handler: (interaction: ButtonInteraction, props: P) => any;
};

export class FormHelper<Props> {
  private context: ActionContext;
  private formConfig: FormConfig<Props>;
  private hash: string; // Unique hash for each form instance

  private buttonIdMap: Map<string, ButtonConfig<Props>> = new Map();
  private selectIdMap: Map<string, FormFieldConfig> = new Map();

  constructor(context: any, formConfig: FormConfig<Props>) {
    this.context = context;
    this.formConfig = formConfig;
    this.hash = uuidv4(); // Generate a unique hash for the instance
  }
  generateFormComponents() {
    let components = [];

    for (const field of this.formConfig.fields) {
      const generatedId = uuidv4();
      this.selectIdMap.set(generatedId, field); // Map the generatedId to the fieldConfig

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(generatedId) // Use the generated UUID
        .setPlaceholder(field.placeholder)
        .setOptions(field.options);

      const formRow =
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          selectMenu,
        );
      components.push(formRow);
    }

    const buttons: ButtonBuilder[] = [];
    for (const buttonConfig of this.formConfig.buttons) {
      const generatedId = uuidv4();
      this.buttonIdMap.set(generatedId, buttonConfig); // Map the generatedId to the buttonConfig

      const button = new ButtonBuilder({
        customId: generatedId,
        label: buttonConfig.label,
        style: buttonConfig.style,
      });
      buttons.push(button);
    }
    components.push(
      new ActionRowBuilder<ButtonBuilder>().setComponents(buttons),
    );

    return components;
  }
  async collectFormResponses() {
    this.context.response = await this.context.interaction.editReply({
      content: this.formConfig.label,
      components: this.generateFormComponents(),
    });

    const collector = this.context.response.createMessageComponentCollector({
      time: 1000 * 60 * 10,
      filter: (i) => i.user.id === this.context.player.discordId,
    });

    const props = {};
    for (const field of this.formConfig.fields) {
      props[field.propKey] = field.defaultValue;
    }

    collector.on(
      'collect',
      async (interaction: StringSelectMenuInteraction | ButtonInteraction) => {
        if (interaction instanceof StringSelectMenuInteraction) {
          const fieldConfig = this.selectIdMap.get(interaction.customId);
          if (fieldConfig) {
            await interaction.deferReply({ ephemeral: true });

            let value: any;
            if (fieldConfig.pipe) {
              value = fieldConfig.pipe(interaction.values[0]);
            } else {
              value = interaction.values[0];
            }
            props[fieldConfig.propKey] = value;
            await interaction.deleteReply();
          }
        } else if (interaction instanceof ButtonInteraction) {
          await interaction.deferReply({ ephemeral: true });
          const buttonConfig = this.buttonIdMap.get(interaction.customId);
          if (buttonConfig) {
            try {
              await this.context.interaction.editReply({
                components: [],
              });
              await buttonConfig.handler(interaction, props as any);
            } catch (error) {
              await this.context.interaction.followUp({
                content: `Erro ao processar ação: ${error.message}`,
                ephemeral: true,
              });
            }
          }
          await interaction.deleteReply();
          collector.stop('Handled');
        }
      },
    );

    // collector.on('end', async (collected, reason) => {

    // });
  }

  async init() {
    this.generateFormComponents();
    await this.collectFormResponses();
  }
}
