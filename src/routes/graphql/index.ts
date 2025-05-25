import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import {
  graphql,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLFloat,
  validate,
  parse,
} from 'graphql';
import { User } from '@prisma/client';
import { UUID } from './types/uuid.js';
import {
  DtoProfileType,
  DtoPostType,
  DtoChangeProfileType,
  DtoChangePostType,
} from './types/types.js';
import { MemberTypeId, MemberType } from './types/member-types.js';
import { PostType, CreatePostInputType, ChangePostInputType } from './types/posts-types.js';
import { ProfileType, CreateProfileInputType, ChangeProfileInputType } from './types/profile-types.js';
import { CreateUserInputType, ChangeUserInputType } from './types/user-types.js';
import depthLimit from 'graphql-depth-limit';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

   const UserType = new GraphQLObjectType({
    name: 'UserType',
    fields: () => ({
      id: { type: UUID },
      name: { type: GraphQLString },
      balance: { type: GraphQLFloat },
      profile: { type: ProfileType },
      posts: { type: new GraphQLList(PostType) },
      userSubscribedTo: {
        type: new GraphQLList(UserType),
        resolve: async (parent: User) => {
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
        },
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
            return await prisma.memberType.findMany();
          },
        },
        memberType: {
          type: MemberType,
          args: {
            id: { type: MemberTypeId },
          },
          resolve: async (parent, args: { id: string }) => {
            const memberType = await prisma.memberType.findUnique({
              where: {
                id: args.id,
              },
            });
            return memberType;
          },
        },
        posts: {
          type: new GraphQLList(PostType),
          resolve: async () => {
            return await prisma.post.findMany();
          },
        },
        post: {
          type: PostType,
          args: {
            id: { type: UUID },
          },
          resolve: async (parent, args: { id: string }) => {
            const post = await prisma.post.findUnique({
              where: {
                id: args.id,
              },
            });
            return post;
          },
        },
        users: {
          type: new GraphQLList(UserType),
          resolve: async () => {
            return await prisma.user.findMany({
              include: {
                profile: {
                  include: {
                    memberType: true,
                  },
                },
                posts: true,
                userSubscribedTo: true,
                subscribedToUser: true,
              },
            });
          },
        },
        user: {
          type: UserType,
          args: {
            id: { type: UUID },
          },
          resolve: async (parent, args: { id: string }): Promise<User | null> => {
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
                subscribedToUser: true,
              },
            });
            return user;
          },
        },
        profiles: {
          type: new GraphQLList(ProfileType),
          resolve: async () => {
            return await prisma.profile.findMany();
          },
        },
        profile: {
          type: ProfileType,
          args: {
            id: { type: UUID },
          },
          resolve: async (parent, args: { id: string }) => {
            const profile = await prisma.profile.findUnique({
              where: {
                id: args.id,
              },
            });
            return profile;
          },
        },
      },
    }),
    mutation: new GraphQLObjectType({
      name: 'Mutations',
      fields: {
        createUser: {
          type: UserType,
          args: {
            dto: { type: CreateUserInputType },
          },
          resolve: async (_, args: {dto: { name: string; balance: number }}) => {
            return await prisma.user.create({
              data: { name: args.dto.name, balance: args.dto.balance },
            });
          },
        },
        createProfile: {
          type: ProfileType,
          args: {
            dto: { type: CreateProfileInputType },
          },
          resolve: async (_, args: {dto: DtoProfileType}) => {
            return await prisma.profile.create({ data: args.dto });
          },
        },
        createPost: {
          type: PostType,
          args: {
            dto: { type: CreatePostInputType },
          },
          resolve: async (_, args: {dto: DtoPostType}) => {
            return await prisma.post.create({ data: args.dto });
          },
        },
        changeUser: {
          type: UserType,
          args: {
            id: { type: UUID },
            dto: { type: ChangeUserInputType },
          },
          resolve: async (_, args: { id: string, dto: { name: string; balance: number }}) => {
            const { id, dto } = args;
            return await prisma.user.update({ where: { id: id }, data: dto });
          },
        },
        changeProfile: {
          type: ProfileType,
          args: {
            id: { type: UUID },
            dto: { type: ChangeProfileInputType },
          },
          resolve: async (_, args: DtoChangeProfileType) => {
            const { id, dto } = args;
            return await prisma.profile.update({ where: { id: id }, data: dto });
          },
        },
        changePost: {
          type: PostType,
          args: {
            id: { type: UUID },
            dto: { type: ChangePostInputType },
          },
          resolve: async (_, args: DtoChangePostType) => {
            const { id, dto } = args;
            return await prisma.post.update({ where: { id: id }, data: dto });
          },
        },
        deleteUser: {
          type: GraphQLString,
          args: {
            id: { type: UUID },
          },
          resolve: async (_, args: {id: string}) => {
            const deleted = await prisma.user.delete({ where: { id: args.id } });
            return deleted.id;
          },
        },
        deleteProfile: {
          type: GraphQLString,
          args: {
            id: { type: UUID },
          },
          resolve: async (_, args: {id: string}) => {
            const deleted = await prisma.profile.delete({ where: { id: args.id } });
            return deleted.id;
          },
        },
        deletePost: {
          type: GraphQLString,
          args: {
            id: { type: UUID },
          },
          resolve: async (_, args: {id: string}) => {
            const deleted = await prisma.post.delete({ where: { id: args.id } });
            return deleted.id;
          },
        },
        subscribeTo: {
          type: GraphQLString,
          args: {
            userId: { type: UUID },
            authorId: { type: UUID },
          },
          resolve: async (_, args: { userId: string; authorId: string }) => {
            const { userId, authorId } = args;
            const subscribed = await prisma.subscribersOnAuthors.create({
              data: {
                subscriberId: userId,
                authorId: authorId,
              },
            });
            return subscribed.subscriberId;
          },
        },
        unsubscribeFrom: {
          type: GraphQLString,
          args: {
            userId: { type: UUID },
            authorId: { type: UUID },
          },
          resolve: async (_, args: { userId: string; authorId: string }) => {
            const { userId, authorId } = args;
            const unsubscribed = await prisma.subscribersOnAuthors.delete({
              where: {
                subscriberId_authorId: {
                  subscriberId: userId,
                  authorId: authorId,
                },
              },
            });
            return unsubscribed.subscriberId;
          },
        },
      },
    }),
  });

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
      const { query, variables } = req.body;
      const errors = validate(schema, parse(query), [depthLimit(5)]);
      if (errors.length > 0) return { data: null, errors}
      return await graphql({
        schema,
        source: query,
        variableValues: variables,
      });
    },
  });
};

export default plugin;
