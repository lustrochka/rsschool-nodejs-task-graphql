import { GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLInt, GraphQLBoolean, GraphQLList, GraphQLEnumType } from 'graphql';
import { UUID } from './types/uuid.js';

export const MemberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: { value: 'BASIC' },
    BUSINESS: { value: 'BUSINESS' },
  },
});

export const MemberType = new GraphQLObjectType({
    name: 'MemberType',
    fields: () => ({
      id: { type: MemberTypeId },
      discount: { type: GraphQLFloat },
      postsLimitPerMonth: { type: GraphQLInt },
    }),
  });

  export const PostType = new GraphQLObjectType({
    name: 'PostType',
    fields: () => ({
      id: { type: UUID },
      title: { type: GraphQLString },
      content: { type: GraphQLString },
    }),
  });

  export const ProfileType = new GraphQLObjectType({
    name: 'ProfileType',
    fields: () => ({
    id: { type: UUID },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberType: {type: MemberType}
}),
});

  export const UserType = new GraphQLObjectType({
    name: 'UserType',
    fields: () => ({
            id: { type: UUID },
            name: { type: GraphQLString },
            balance: { type: GraphQLFloat },
            profile: { type: ProfileType },
            posts: {type: new GraphQLList(PostType)},
            userSubscribedTo: {type: new GraphQLList(UserType)},
            subscribedToUser: {type: new GraphQLList(UserType)}
    }),
  });