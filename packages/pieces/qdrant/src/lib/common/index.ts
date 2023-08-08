import { Property } from '@activepieces/pieces-framework';

export const filteringProps = {
  must: Property.Object({
    displayName: 'Must Have',
    description:
      'If the point have this property in his payload it will be selected',
    required: true,
  }),
  must_not: Property.Object({
    displayName: 'Must Not Have',
    description:
      'If the point have this property in his payload it will not be selected',
    required: true,
  }),
};

export const seclectPointsProps = {
  getPointsBy: Property.StaticDropdown({
    displayName: 'Choose Points By',
    description: 'The method to use to get the points',
    options: {
      options: [
        { label: 'Ids', value: 'Ids' },
        { label: 'Filtering', value: 'Filtering' },
      ],
    },
    defaultValue: 'Ids',
    required: true,
  }),
  infosToGetPoint: Property.DynamicProperties({
    displayName: 'By ids or filtering',
    description: 'The infos to select points',
    refreshers: ['getPointsBy'],
    props: async (propsValue) => {
      const { getPointsBy } = propsValue as unknown as {
        getPointsBy: 'Ids' | 'Filtering';
      };
      if (getPointsBy === 'Ids')
        return {
          ids: Property.ShortText({
            displayName: 'Ids',
            description: 'The ids of the points to choose',
            required: true,
          }),
        };
      return filteringProps as any;
    },
    required: true,
  }),
};

export const convertToFilter = (infosToGetPoint: {must: any; must_not: any}) => {
  type Tfilter = { key: string; match: { value: any } }[];
  const filter = { must: [], must_not: [] } as {
    must: Tfilter;
    must_not: Tfilter;
  };

  for (const getKey in infosToGetPoint) {
    for (const key in infosToGetPoint[getKey as keyof typeof filter]) {
      const value = infosToGetPoint[getKey as keyof typeof filter][key];
      filter[getKey as keyof typeof filter].push({ key, match: { value } });
    }
  }
  return filter;
};
