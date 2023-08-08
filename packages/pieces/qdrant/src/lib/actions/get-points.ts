import { Property, createAction } from "@activepieces/pieces-framework";
import { seclectPointsProps, convertToFilter } from "../common";
import { qdrantAuth } from "../..";
import { QdrantClient } from "@qdrant/js-client-rest";
import { isArray } from "lodash";

export const getPoints = createAction({
  auth: qdrantAuth,
  name: 'get_points',
  displayName: 'Get Points',
  description: 'Get the points of a specific collection',
  props: {
    collectionName: Property.ShortText({
      displayName: 'Collection Name',
      description: 'The name of the collection to get the points from',
      required: true,
    }),
    ...seclectPointsProps
  },
  run: async ({ auth, propsValue }) => {
    const client = new QdrantClient({
      apiKey: auth.key,
      url: auth.serverAdress,
    })
    if (propsValue.getPointsBy === 'Ids') {
      const ids = propsValue.infosToGetPoint['Ids']
      return await client.retrieve(propsValue.collectionName, {
        ids: isArray(ids) ? ids : [ids]
      })
    }
    
    if (propsValue.getPointsBy === 'Filtering') {
      const filtering = propsValue.infosToGetPoint['Filtering']
      return await client.scroll(propsValue.collectionName, {
        filter: convertToFilter(filtering)
      })
    }
  }
})