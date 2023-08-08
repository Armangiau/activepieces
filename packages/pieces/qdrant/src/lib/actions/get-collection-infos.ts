import { QdrantClient } from "@qdrant/js-client-rest";
import { qdrantAuth } from "../..";
import { createAction, Property } from "@activepieces/pieces-framework";

export const collectionInfos = createAction({
  auth: qdrantAuth,
  name: 'collection_infos',
  displayName: 'Get Collection Infos',
  description: 'Get the all the infos of a specific collection',
  props: {
    collectionName: Property.ShortText({
      displayName: 'Collection Name',
      description: 'The name of the collection to get the infos from',
      required: true,
    })
  },
  run: async ({auth, propsValue}) => {
    const client = new QdrantClient({
      apiKey: auth.key,
      url: auth.serverAdress,
    });
    const collectionInfos = await client.getCollection(propsValue.collectionName);
    return collectionInfos
  }
})