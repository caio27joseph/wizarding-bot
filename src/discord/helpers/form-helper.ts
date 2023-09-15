import {
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuInteraction,
  ButtonInteraction,
  CacheType,
  MessagePayload,
  CommandInteraction,
} from 'discord.js';
import { v4 as uuidv4 } from 'uuid'; // Ensure you have uuid installed.
import { ActionContext } from './menu-helper';

export type FieldChoice = {
  label: string;
  value: any;
};

export type FormFieldConfig<P> = {
  placeholder: string;
  propKey: keyof P;
  defaultValue?: any;
  pipe?: (value: string) => any;
  choices: FieldChoice[];
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
  private hash: string; // Unique hash for each form instance

  private buttonIdMap: Map<string, ButtonConfig<Props>> = new Map();
  private selectIdMap: Map<string, FormFieldConfig<Props>> = new Map();

  constructor(
    private readonly interaction: CommandInteraction,
    private readonly formConfig: FormConfig<Props>,
  ) {
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
        .setOptions(field.choices);

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
    const response = await this.interaction.editReply({
      content: this.formConfig.label,
      components: this.generateFormComponents(),
    });

    const collector = response.createMessageComponentCollector({
      time: 1000 * 60 * 10,
      filter: (i) => i.user.id === this.interaction.user.id,
    });

    const props: Props = {} as any;
    for (const field of this.formConfig.fields) {
      props[field.propKey] = field.defaultValue;
    }

    collector.on(
      'collect',
      async (i: StringSelectMenuInteraction | ButtonInteraction) => {
        await i.deferUpdate();
        if (i instanceof StringSelectMenuInteraction) {
          const fieldConfig = this.selectIdMap.get(i.customId);
          if (fieldConfig) {
            let value: any;
            if (fieldConfig.pipe) {
              value = fieldConfig.pipe(i.values[0]);
            } else {
              value = i.values[0];
            }
            props[fieldConfig.propKey] = value;
          }
        } else if (i instanceof ButtonInteraction) {
          const buttonConfig = this.buttonIdMap.get(i.customId);
          if (buttonConfig) {
            try {
              try {
                await this.interaction.editReply({
                  components: [],
                });
              } catch (error) {
                debugger;
              }
              await buttonConfig.handler(i, props as any);
            } catch (error) {
              await this.interaction.followUp({
                content: `Erro ao processar ação: ${error.message}`,
                ephemeral: true,
              });
            }
          }
          collector.stop('Handled');
        }
      },
    );

    collector.on('end', async (collected, reason) => {});
    return response;
  }

  async init() {
    this.generateFormComponents();
    return this.collectFormResponses();
  }
}
export class FormHelperBuilder<Props> {
  private _configOptions: FormConfig<Props> = {
    label: '',
    fields: [],
    buttons: [],
  };
  private _resolvePromise!: (value: Props | PromiseLike<Props>) => void;
  private _rejectPromise!: (reason?: any) => void;

  constructor(config?: FormConfig<Props>) {
    if (config) {
      this._configOptions = config;
    }
  }

  setLabel(labelTemplate: string): this {
    this._configOptions.label = labelTemplate;
    return this;
  }

  addFields(...fields: FormFieldConfig<Props>[]): this {
    this._configOptions.fields.push(...fields);
    return this;
  }

  addButtons(...buttons: ButtonConfig<Props>[]): this {
    this._configOptions.buttons.push(...buttons);
    return this;
  }

  private addDefaultButtons(): void {
    // Cancel button
    this._configOptions.buttons.push({
      label: 'Cancelar',
      style: ButtonStyle.Danger,
      handler: async (interaction, props) => {
        this._rejectPromise(new Error('Cancelado'));
      },
    });

    // OK button
    this._configOptions.buttons.push({
      label: 'OK',
      style: ButtonStyle.Success,
      handler: async (interaction, props) => {
        this._resolvePromise(props);
      },
    });
  }

  init(interaction: CommandInteraction): Promise<Props> {
    return new Promise(async (resolve, reject) => {
      this._resolvePromise = resolve;
      this._rejectPromise = reject;

      this.addDefaultButtons();

      const formHelper = new FormHelper<Props>(
        interaction,
        this._configOptions,
      );

      try {
        await formHelper.init();
      } catch (error) {
        reject(error);
      }
    });
  }
}
