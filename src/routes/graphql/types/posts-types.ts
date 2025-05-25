import {
  GraphQLString,  
  GraphQLObjectType,
  GraphQLInputObjectType,
} from 'graphql';
import { UUID } from './uuid.js';

export const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
      id: { type: UUID },
      title: { type: GraphQLString },
      content: { type: GraphQLString },
    }),
  });

export const CreatePostInputType = new GraphQLInputObjectType({
      name: 'CreatePostInput',
      fields: () => ({
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        authorId: { type: UUID },
      }),
    });

export const ChangePostInputType = new GraphQLInputObjectType({
        name: 'ChangePostInput',
        fields: () => ({
          title: { type: GraphQLString },
          content: { type: GraphQLString },
        }),
      });