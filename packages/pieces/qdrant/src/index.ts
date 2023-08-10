import { createPiece, PieceAuth, Property } from "@activepieces/pieces-framework";
import { addPointsToCollection } from "./lib/actions/add-points";
import { collectionList } from "./lib/actions/get-collection-list";
import { collectionInfos } from "./lib/actions/get-collection-infos";
import { deleteCollection } from "./lib/actions/delete-collection";
import { deletePoints } from "./lib/actions/delete-points";
import { getPoints } from "./lib/actions/get-points";
import { searchPoints } from "./lib/actions/search-points";
import { upCollectionNames } from './lib/common'
import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrantAuth = PieceAuth.CustomAuth({
  displayName: "Qdrant Connection",
  props: {
    serverAdress: Property.ShortText({
      displayName: "Server Adress",
      required: true,
      description: "The url of the Qdrant instance.",
    }),
    key: PieceAuth.SecretText({
      displayName: "API KEY",
      required: true,
      description: "Enter the API Key of your Qdrant account",
    }),
  },
  validate: async ({auth}) => {
    const client = new QdrantClient({
      url: auth.serverAdress,
      apiKey: auth.key,
    })
    try {
      upCollectionNames().replace((await client.getCollections()).collections.map((c) => c.name));
    } catch (e) {
      return {valid: false, error: (e as Error).message}
    }
    return {valid: true}
  },
  required: true,
})

export const qdrant = createPiece({
  displayName: "Qdrant",
  auth: qdrantAuth,
  minimumSupportedRelease: '0.6.0',
  logoUrl: "https://cdn.activepieces.com/pieces/qdrant.png",
  authors: ['ArmanGiau'],
  actions: [addPointsToCollection, collectionList, collectionInfos, deleteCollection, deletePoints, getPoints, searchPoints],
  triggers: [],
});
