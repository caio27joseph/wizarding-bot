import { FormConfig, FormHelper } from '~/discord/helpers/form-helper';
import { ResourceProviderActionContext } from './new-provider.form';
import { ButtonStyle } from 'discord.js';

interface NewValidRoll {
  secret: boolean;
  metaForMaxDrop: number;
}

export const getNewValidRollForm = (context: ResourceProviderActionContext) => {
  const promise: Promise<NewValidRoll> = new Promise((resolve, reject) => {
    const config: FormConfig<NewValidRoll> = {
      label: `Novo Rolagem`,
      fields: [
        {
          placeholder: 'Rolagem secreta? [Não]',
          propKey: 'secret',
          defaultValue: false,
          choices: ['Sim', 'Não'].map((n) => ({
            label: n.toString(),
            value: n.toString(),
          })),
          pipe: (value) => value === 'Sim',
        },
        {
          placeholder: 'Meta para drop máximo [3]',
          propKey: 'metaForMaxDrop',
          defaultValue: 3,
          choices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(
            (n) => ({
              label: n.toString() + ' de Meta',
              value: n.toString(),
            }),
          ),
          pipe: (value) => parseInt(value),
        },
      ],
      buttons: [
        {
          label: 'Cancelar',
          style: ButtonStyle.Danger,
          handler: async (i, form) => {
            reject(null);
          },
        },
        {
          label: 'Adicionar',
          style: ButtonStyle.Success,
          handler: async (i, form) => {
            resolve(form);
          },
        },
      ],
    };

    new FormHelper<NewValidRoll>(context.interaction, config).init();
  });
  return promise;
};
