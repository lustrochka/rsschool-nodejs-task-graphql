import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, GraphQLList, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { MemberType, PostType, UserType, ProfileType } from './types.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'RootQuery',
      fields: {
        memberTypes: {
          type: new GraphQLList(MemberType),
          resolve: async () => {
            return prisma.memberType.findMany();
          }
        },
        posts: {
          type: new GraphQLList(PostType),
          resolve: async () => {
            return prisma.post.findMany();
          }
        },
        users: {
          type: new GraphQLList(UserType),
          resolve: async () => {
            return prisma.user.findMany();
          }
        },
        profiles: {
          type: new GraphQLList(ProfileType),
          resolve: async () => {
            return prisma.profile.findMany();
          }
        }
      }
    })
  })

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      return graphql({
        schema,
        source: req.body.query,
        variableValues: req.body.variables
      });
    },
  });
};

export default plugin;
