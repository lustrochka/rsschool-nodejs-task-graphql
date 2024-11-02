import { GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLInt, GraphQLBoolean, GraphQLList } from 'graphql';

export const MemberType = new GraphQLObjectType({
    name: 'MemberType',
    fields: {
      id: { type: GraphQLString },
      discount: { type: GraphQLFloat },
      postsLimitPerMonth: { type: GraphQLInt },
    },
  });

  export const PostType = new GraphQLObjectType({
    name: 'PostType',
    fields: {
      id: { type: GraphQLString },
      title: { type: GraphQLString },
      content: { type: GraphQLString },
    },
  });

  export const ProfileType = new GraphQLObjectType({
    name: 'ProfileType',
    fields: {
    id: { type: GraphQLString },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberType: {type: MemberType}
},
});

  export const UserType = new GraphQLObjectType({
    name: 'UserType',
    fields: () => ({
            id: { type: GraphQLString },
            name: { type: GraphQLString },
            balance: { type: GraphQLFloat },
            profile: { type: ProfileType },
            posts: {type: new GraphQLList(PostType)},
            userSubscribedTo: {type: new GraphQLList(UserType)},
            subscribedToUser: {type: new GraphQLList(UserType)}
    }),
  });