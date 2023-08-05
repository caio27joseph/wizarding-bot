import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UpdateResult {
  @Field()
  affected: number;
}

@ObjectType()
export class DeleteResult {
  @Field()
  affected: number;
}
