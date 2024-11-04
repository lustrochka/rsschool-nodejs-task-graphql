import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, GraphQLList, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { GraphQLString, GraphQLFloat, GraphQLInt, GraphQLBoolean, GraphQLEnumType } from 'graphql';
import { UUID } from './types/uuid.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  const MemberTypeId = new GraphQLEnumType({
    name: 'MemberTypeId',
    values: {
      BASIC: { value: 'BASIC' },
      BUSINESS: { value: 'BUSINESS' },
    },
  });
  
  const MemberType = new GraphQLObjectType({
      name: 'MemberType',
      fields: () => ({
        id: { type: MemberTypeId },
        discount: { type: GraphQLFloat },
        postsLimitPerMonth: { type: GraphQLInt },
      }),
    });
  
    const PostType = new GraphQLObjectType({
      name: 'PostType',
      fields: () => ({
        id: { type: UUID },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
      }),
    });
  
    const ProfileType = new GraphQLObjectType({
      name: 'ProfileType',
      fields: () => ({
      id: { type: UUID },
      isMale: { type: GraphQLBoolean },
      yearOfBirth: { type: GraphQLInt },
      memberType: {type: MemberType}
  }),
  });
  
    const UserType = new GraphQLObjectType({
      name: 'UserType',
      fields: () => ({
              id: { type: UUID },
              name: { type: GraphQLString },
              balance: { type: GraphQLFloat },
              profile: { type: ProfileType },
              posts: {type: new GraphQLList(PostType)},
              userSubscribedTo: {
                type: new GraphQLList(UserType),
                resolve: async (parent) => {
                  return prisma.user.findMany({
                    where: {
                      subscribedToUser: {
                        some: {
                          subscriberId: parent.id,
                        },
                      },
                    },
                  });
                },
              },
              subscribedToUser: {
                type: new GraphQLList(UserType),
                resolve: async (parent) => {
                  return prisma.user.findMany({
                    where: {
                      userSubscribedTo: {
                        some: {
                          authorId: parent.id,
                        },
                      },
                    },
                  });
                }
              },
      }),
    });

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
            return post;
          }
        },
        users: {
          type: new GraphQLList(UserType),
          resolve: async () => {
            return prisma.user.findMany({
              include: {
                profile: {
                  include: {
                    memberType: true,
                  },
                },
                posts: true,
                userSubscribedTo: true,
                subscribedToUser: true
              },
            });
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
              include: {
                profile: {
                  include: {
                    memberType: true,
                  },
                },
                posts: true,
                userSubscribedTo: true,
                subscribedToUser: true
              },
            });
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
