import { GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLInt } from 'graphql';

export const MemberType = new GraphQLObjectType({
    name: 'MemberType',
    fields: {
      id: { type: GraphQLString },
      discount: { type: GraphQLFloat },
      postsLimitPerMonth: { type: GraphQLInt },
    },
  });