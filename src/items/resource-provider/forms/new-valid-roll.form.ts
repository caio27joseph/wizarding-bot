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
      label: `Novo Provedor de Item 4/4: ${context.item.name}`,
      fields: [
        {
          placeholder: 'Recurso secreto? [Não]',
          propKey: 'secret',
          defaultValue: false,
          options: ['Sim', 'Não'].map((n) => ({
            label: n.toString(),
            value: n.toString(),
          })),
          pipe: (value) => value === 'Sim',
        },
        {
          placeholder: 'Meta para drop máximo [3]',
          propKey: 'metaForMaxDrop',
          defaultValue: 3,
          options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(
            (n) => ({
              label: n.toString() + ' horas',
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

    new FormHelper<NewValidRoll>(context, config).init();
  });
  return promise;
};
