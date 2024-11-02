import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, GraphQLList, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { MemberType, PostType, UserType, ProfileType, MemberTypeId } from './types.js';
import { UUID } from './types/uuid.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma, httpErrors } = fastify;

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
        memberType: {
          type: MemberType,
          args: {
            id: { type: MemberTypeId }
          },
          resolve: async (parent, args: { id: string}) => {
            const memberType = await prisma.memberType.findUnique({
              where: {
                id: args.id,
              },
            });
            if (memberType === null) {
              throw httpErrors.notFound();
            }
            return memberType;
          }
        },
        posts: {
          type: new GraphQLList(PostType),
          resolve: async () => {
            return prisma.post.findMany();
          }
        },
        post: {
          type: PostType,
          args: {
            id: { type: UUID }
          },
          resolve: async (parent, args: { id: string}) => {
            const post = await prisma.post.findUnique({
              where: {
                id: args.id,
              },
            });
            if (post === null) {
              throw httpErrors.notFound();
            }
            return post;
          }
        },
        users: {
          type: new GraphQLList(UserType),
          resolve: async () => {
            return prisma.user.findMany();
          }
        },
        user: {
          type: UserType,
          args: {
            id: { type: UUID }
          },
          resolve: async (parent, args: { id: string}) => {
            const user = await prisma.user.findUnique({
              where: {
                id: args.id,
              },
            });
            if (user === null) {
              throw httpErrors.notFound();
            }
            return user;
          }
        },
        profiles: {
          type: new GraphQLList(ProfileType),
          resolve: async () => {
            return prisma.profile.findMany();
          }
        },
        profile: {
          type: ProfileType,
          args: {
            id: { type: UUID }
          },
          resolve: async (parent, args: { id: string}) => {
            const profile = await prisma.profile.findUnique({
              where: {
                id: args.id,
              },
            });
            if (profile === null) {
              throw httpErrors.notFound();
            }
            return profile;
          }
        },
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
