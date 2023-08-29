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

export type FormFieldConfig<P> = {
  placeholder: string;
  propKey: keyof P;
  defaultValue?: any;
  pipe?: (value: string) => any;
  options: OptionConfig[];
  disabled?: boolean;
};

export type FormConfig<P> = {
  label: string;
  fields: FormFieldConfig<P>[];
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
  private selectIdMap: Map<string, FormFieldConfig<Props>> = new Map();

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
      if (!field.disabled) {
        components.push(formRow);
      }
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
      filter: (i) => i.user.id === this.context.interaction.user.id,
    });

    const props: Props = {} as any;
    for (const field of this.formConfig.fields) {
      props[field.propKey] = field.defaultValue;
    }

    collector.on(
      'collect',
      async (i: StringSelectMenuInteraction | ButtonInteraction) => {
        if (i instanceof StringSelectMenuInteraction) {
          const fieldConfig = this.selectIdMap.get(i.customId);
          if (fieldConfig) {
            await i.deferReply({ ephemeral: true });

            let value: any;
            if (fieldConfig.pipe) {
              value = fieldConfig.pipe(i.values[0]);
            } else {
              value = i.values[0];
            }
            props[fieldConfig.propKey] = value;
            await i.deleteReply();
          }
        } else if (i instanceof ButtonInteraction) {
          await i.deferReply({ ephemeral: true });
          const buttonConfig = this.buttonIdMap.get(i.customId);
          if (buttonConfig) {
            try {
              try {
                await this.context.interaction.editReply({
                  components: [],
                });
              } catch (error) {
                debugger;
              }
              await i.deleteReply();
              await buttonConfig.handler(i, props as any);
            } catch (error) {
              await i.deleteReply();
              await this.context.interaction.followUp({
                content: `Erro ao processar ação: ${error.message}`,
                ephemeral: true,
              });
            }
          }
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
1;
