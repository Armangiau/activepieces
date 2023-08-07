import { QdrantClient } from '@qdrant/js-client-rest';
import { qdrantAuth } from '../..';
import {
  createAction,
  Property,
  Validators,
} from '@activepieces/pieces-framework';
import { isArray } from 'lodash';
import { randomUUID } from 'crypto';

export const addPointsToCollection = createAction({
  auth: qdrantAuth,
  requireAuth: true,
  name: 'add_points_to_collection',
  displayName: 'Add points to collection',
  description:
    'Instert a point (= embedding or vector + other infos) to a specific collection, if the collection does not exist it will be created v',
  props: {
    collectionName: Property.ShortText({
      displayName: 'Collection Name',
      description: 'The name of the collection to add the point to',
      required: true,
    }),
    embeddings: Property.ShortText({
      displayName: 'Embeddings',
      description: 'Embeddings (= vectors) for the points',
      // validators: [
      //   Validators.pattern(
      //     /^\s*\[\s*(-?\d+(\.\d+)?\s*(,\s*-?\d+(\.\d+)?\s*)*)?\]\s*$/
      //   ), // verfy if it is an array of numbers
      // ],
      required: true,
    }),
    embeddingsIds: Property.ShortText({
      displayName: 'Embeddings Ids',
      description: 'The ids of the embeddings for the points',
      defaultValue: 'Auto',
      required: true,
      // validators: [
      //   Validators.pattern(
      //     /^\s*\[\s*("[^"\\]*(\\.[^"\\]*)*"\s*(,\s*"[^"\\]*(\\.[^"\\]*)*"\s*)*)?\]\s*|Auto$/
      //   ), // verfy if it is an array of strings or the Auto value
      // ],
    }),
    distance: Property.StaticDropdown({
      displayName: 'Calculation Method of distance',
      description:
        "The calculation method helps to rank vectors when you want to find the closest points, the method to use depends on the model who's created the embeddings, see the documentation of your model",
      defaultValue: 'Cosine',
      options: {
        options: [
          { label: 'Cosine', value: 'Cosine' },
          { label: 'Euclidean', value: 'Euclid' },
          { label: 'Dot', value: 'Dot' },
        ],
      },
      required: true,
    }),
    payloads: Property.Object({
      displayName: 'Payloads',
      description: 'The additional informations for the points',
      required: false
    }),
  },
  run: async ({ auth, propsValue }) => {
    const client = new QdrantClient({
      apiKey: auth.key,
      url: auth.serverAdress,
    });

    console.warn('ids: \n', propsValue.embeddingsIds, 'embeddings(12) : \n', propsValue.embeddings[12], 'embeddings : \n', propsValue.embeddings )
    
    const embeddings = propsValue.embeddings as unknown as number[][]

    const numberOfEmbeddings = embeddings.length;
    const embeddingsLen = embeddings[0].length;

    for (const embedding of embeddings) {
      if (embedding.length != embeddingsLen)
        throw new Error(
          'Embeddings must have the same length (=number of dimensions)'
        );
    }

    const embeddingsIds = propsValue.embeddingsIds as unknown as
      | string[]
      | 'Auto';

    const autoEmbeddingsIds = embeddingsIds === 'Auto';
    
    if (!autoEmbeddingsIds && embeddingsIds.length != numberOfEmbeddings)
      throw new Error(
        'The number of embeddings Ids and the number of embeddings must be the same'
      );

    const payloads = propsValue.payloads;

    for (const key in payloads) {
      const element = payloads[key];
      if (typeof element == 'string') {
        try {
          payloads[key] = JSON.parse(element);
        } catch {
          null;
        }
      }
    }

    const points = [];

    for (let i = 0; i < numberOfEmbeddings; i++) {
      const payload = {} as any;

      for (const key in payloads) {
        const elem = payloads[key];
        if (isArray(elem) && elem.length == numberOfEmbeddings) {
          payload[key] = elem[i];
        } else {
          payload[key] = elem;
        }
      }

      points.push({
        id: autoEmbeddingsIds ? randomUUID() : embeddingsIds[i],
        payload,
        vector: embeddings[i],
      });
    }

    const collection = (await client.getCollections()).collections;
    if (
      !collection.includes({
        name: propsValue.collectionName,
      })
    ) {
      await client.createCollection(propsValue.collectionName, {
        vectors: {
          size: embeddingsLen,
          distance: propsValue.distance as 'Dot' | 'Cosine' | 'Euclid',
        },
        on_disk_payload: true,
      });
    }

    const response = await client.upsert(propsValue.collectionName, {
      points,
    });

    return response;
  },
});
