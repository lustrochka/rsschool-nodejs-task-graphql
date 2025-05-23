export type DtoProfileType = {
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: MemberTypeId;
};

export enum MemberTypeId {
  BASIC = 'BASIC',
  BUSINESS = 'BUSINESS',
}

export type DtoPostType = {
  title: string;
  content: string;
  authorId: string;
};

export type DtoChangeProfileType = {
  id: string;
  dto: Omit<DtoProfileType, 'userId'>;
};

export type DtoChangePostType = {
  id: string;
  dto: Omit<DtoPostType, 'authorId'>;
};
