import {createAction } from '@activepieces/pieces-framework';
import { collectionName, convertToFilter, seclectPointsProps } from '../common';
import { qdrantAuth } from '../..';
import { QdrantClient } from '@qdrant/js-client-rest';
import { isArray } from 'lodash';

export const deletePoints = createAction({
  auth: qdrantAuth,
  name: 'delete_points',
  displayName: 'Delete Points',
  description: 'Delete points of a specific collection',
  props: {
    collectionName: collectionName(),
    ...seclectPointsProps,
  },
  run: async ({ auth, propsValue }) => {
    const client = new QdrantClient({
      apiKey: auth.key,
      url: auth.serverAdress,
    });

    const collectionName = propsValue.collectionName['name'] as string
    if (propsValue.getPointsBy === 'Ids') {
      const ids = propsValue.infosToGetPoint['ids']
      return await client.delete(collectionName, {
        points: isArray(ids) ? ids : [ids],
      });
    }

    return await client.delete(collectionName, {
      filter: convertToFilter(
        propsValue.infosToGetPoint as { must: any; must_not: any }
      ),
    });
  },
});
