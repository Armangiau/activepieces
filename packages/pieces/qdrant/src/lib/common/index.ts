import { Property, type Store } from '@activepieces/pieces-framework';

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

export const convertToFilter = (infosToGetPoint: {
  must: any;
  must_not: any;
}) => {
  type Tfilter = (
    | { has_id: (string | number)[] }
    | { key: string; match: { value: any } }
  )[];
  const filter = { must: [], must_not: [] } as {
    must: Tfilter;
    must_not: Tfilter;
  };

  for (const getKey in infosToGetPoint) {
    for (const key in infosToGetPoint[getKey as keyof typeof filter]) {
      const value = infosToGetPoint[getKey as keyof typeof filter][key];

      if (['id', 'ids'].includes(key.toLocaleLowerCase())) {
        filter[getKey as keyof typeof filter].push({
          has_id: value instanceof Array ? value : [value],
        });
        break;
      }

      const destrucArray = (values: any) => {
        for (const value of values) {
          filter[getKey as keyof typeof filter].push({ key, match: { value } });
          if (value instanceof Array) destrucArray(value);
        }
      };

      if (value instanceof Array) {
        destrucArray(value);
        break;
      }

      filter[getKey as keyof typeof filter].push({ key, match: { value } });
    }
  }
  return filter;
};

let collectionNamesStore: string[] | undefined;
export const upCollectionNames = (store?: Store) => {
  return {
    replace: (names: string[]) => {
      collectionNamesStore = names;
      store?.put('collectionNames', names);
    },
    add: (name: string) => {
      if (collectionNamesStore?.includes(name)) return;
      collectionNamesStore ??= []
      collectionNamesStore.push(name);
      store?.put('collectionNames', collectionNamesStore);
    },
    remove: (name: string) => {
      collectionNamesStore?.splice(collectionNamesStore.indexOf(name), 1);
      store?.put('collectionNames', collectionNamesStore);
    },
  };
};

const collectionNameInfos = {
  displayName: 'Collection Name',
  description: 'The name of the collection needed for this action',
  required: true,
} satisfies { required: true; displayName: string; description: string };

/* export const collectionName =  (canBeNew?: boolean) => collectionNamesStore && !canBeNew ?
Property.Dropdown({
  ...collectionNameInfos,
  refreshers: [],
  options: async () => {
    const options = (collectionNamesStore as string[]).map(name => ({ label: name, value: name }))
    return {options}
  }
}) : Property.ShortText({
  ...collectionNameInfos
}) */


export const collectionName = (canBeNew?: boolean) => {
  const suggestionNameRefrechers = canBeNew ? ['newName', 'auth'] : ['auth']

  const base = {
    collectionName: Property.Dropdown({
      ...collectionNameInfos,
      refreshers: suggestionNameRefrechers,
      options: async (props) => {
        const options = collectionNamesStore ? collectionNamesStore.map((name) => ({
          label: name,
          value: name,
        })) : [];
        
        if (canBeNew && props['auth']) return {
          options,
          disabled: true
        }

        return {options}
      },
    }),
  }
   
  const newName = Property.ShortText({
    displayName: 'New Collection Name',
    description: 'Create a new collection for your qdrant database',
    required: true,
  })


  type Tbase = typeof base & {newName?: typeof newName}

  if (canBeNew) {
    (base as Tbase).newName = newName
  }

  return base as Tbase
}
