import { createAction, Property } from '@activepieces/pieces-framework';
import { convertToFilter, filteringProps } from '../common';
import { qdrantAuth } from '../..';
import { QdrantClient } from '@qdrant/js-client-rest';
import { isArray } from 'lodash';

export const searchPoints = createAction({
  auth: qdrantAuth,
  name: 'search_points',
  displayName: 'Search Points',
  description: 'Search for points closest to your given vector (= embedding)',
  props: {
    collectionName: Property.ShortText({
      displayName: 'Collection Name',
      required: true,
      description: 'The name of the collection you want to search.',
    }),
    vector: Property.ShortText({
      displayName: 'Embedding',
      required: true,
      description: 'The vector (= embedding) you want to search for.',
    }),
    ...filteringProps,
    negativeVector: Property.ShortText({
      displayName: 'Negative Vector',
      required: false,
      description: 'The vector (= embedding) you want to be the farthest.',
    }),
    limitResult: Property.Number({
      displayName: 'Limit Result',
      required: false,
      description: 'The max number of results you want to get.',
      defaultValue: 20,
    }),
  },
  run: async ({ auth, propsValue }) => {
    const client = new QdrantClient({
      apiKey: auth.key,
      url: auth.serverAdress,
    });
    const { must, must_not } = propsValue;

    const filter = convertToFilter({
      must,
      must_not,
    });

    let vector = propsValue.vector as unknown as number[] | number[][] | string;
    let negativeVector = propsValue.negativeVector as unknown as
      | number[]
      | number[][]
      | string
      | undefined;

    if (
      !isArray(vector) ||
      (negativeVector != undefined && !isArray(negativeVector))
    )
      throw new Error('Vectors should be arrays of numbers');

    const changeDeepOfArray = (
      vector: number[] | number[][] | undefined
    ): number[] | undefined => {
      if (!vector || typeof vector[0] === 'number')
        return vector as number[] | undefined;
      if (vector.length !== 1) throw new Error('Only one vector is allowed');
      return changeDeepOfArray(vector[0]);
    };

    vector = changeDeepOfArray(vector) as number[];
    negativeVector = changeDeepOfArray(negativeVector);

    const limit = propsValue.limitResult ?? 20;

    if (propsValue.negativeVector)
      return await client.recommend(propsValue.collectionName, {
        positive: vector,
        negative: negativeVector,
        filter,
        limit,
        with_payload: true,
      });

    return await client.search(propsValue.collectionName, {
      vector,
      filter,
      limit,
      with_payload: true,
    });
  },
});
