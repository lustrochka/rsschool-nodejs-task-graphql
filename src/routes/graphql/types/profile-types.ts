import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLBoolean,
} from 'graphql';
import { UUID } from './uuid.js';
import { MemberType, MemberTypeId } from './member-types.js';

export const ProfileType = new GraphQLObjectType({
    name: 'Profile',
    fields: () => ({
      id: { type: UUID },
      isMale: { type: GraphQLBoolean },
      yearOfBirth: { type: GraphQLInt },
      memberType: { type: MemberType },
    }),
  });

  export const CreateProfileInputType = new GraphQLInputObjectType({
      name: 'CreateProfileInput',
      fields: () => ({
        isMale: { type: GraphQLBoolean },
        yearOfBirth: { type: GraphQLInt },
        userId: { type: UUID },
        memberTypeId: { type: MemberTypeId },
      }),
    });

    export const ChangeProfileInputType = new GraphQLInputObjectType({
        name: 'ChangeProfileInput',
        fields: () => ({
          isMale: { type: GraphQLBoolean },
          yearOfBirth: { type: GraphQLInt },
          memberTypeId: { type: MemberTypeId },
        }),
      });