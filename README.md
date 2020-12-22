# Nuber Eats

The Backend of Nuber Eats Clone

1. Backend Setup:
   - `nest g application` 로 프로젝트 시작하기
   - `nest g mo restaurants` 으로 restaurants 모듈 만들기
   - `git init` 깃 레파지토리 생성
2. GraphQL Setup:

   - graphQL 패키지 설치 및 설정
     - `npm i @nestjs/graphql graphql-tools graphql apollo-server-express`
     - ```typescript
       // app.module.ts
       @Module({
         imports: [
           GraphQLModule.forRoot({
             autoSchemaFile: true,
           }),
           RestaurantsModule,
         ],
         controllers: [],
         providers: [],
       })
       export class AppModule {}
       ```
   - [appollo-server](https://www.apollographql.com/docs/apollo-server/api/apollo-server/) restaurants resolver 만들기
     ```typescript
     // restaurant.resolver.ts
     @Resolver()
     export class RestaurantsResolver {
       @Query(type => Boolean)
       isPizzaGood(): Boolean {
         return true;
       }
     }
     ```
   - restaurants entities 만들기

     ```typescript
     // restaurant.entity.ts
     @ArgsType()
     export class Restaurant {
       @Field(type => String)
       name: string;
     }
     ```
