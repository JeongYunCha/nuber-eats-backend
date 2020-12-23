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
   - restaurants entity 만들기

     - `@ObjectType()`은 스키마 빌드를 위한 GraphQL decorator

     ```typescript
     // restaurant.entity.ts
     @ObjectType()
     export class Restaurant {
       @Field(type => String)
       name: string;
     }
     ```

   - restaurants dto 만들기
     ```typescript
     // create-restaurant.dto.ts
     @ArgsType()
     export class CreateRestaurantDto {
       @Field(type => String)
       name: string;
     }
     ```
   - ArgsTypes 유효성 체크
     - `npm i class-validator`
     ```typescript
     // create-restaurant.dto.ts
     @ArgsType()
     export class CreateRestaurantDto {
       @Field(type => String)
       @IsString()
       @Length(5, 10)
       name: string;
       @Field(type => Boolean)
       @IsBoolean()
       isVegan: boolean;
     }
     ```

3. Database Configuration
   - 패키지 설치: `npm install --save @nestjs/typeorm typeorm pg`
     - [TypeORM](https://typeorm.io/#/supported-platforms)
       - ORM(Object Relational Mapping, 객체-관계 매핑):
         - sequelize
         - mongoose
         - typeorm(Typescript 기반)
     - [postgres in MacOS](https://postgresapp.com/)
     - [postico - graphical client](https://eggerapps.at/postico/)
   - nestjs에서 dotenv 사용하기: `npm i @nestjs/config`
   - dev/test/prod 가상변수 설정: `npm i cross-env`
   - [Joi](https://joi.dev/api/?v=17.3.0)로 스키마 유효성 체크하기: `npm i joi`
     ```typescript
     // app.module.ts
     @Module({
       imports: [
         ConfigModule.forRoot({
           isGlobal: true,
           envFilePath: `.env.${process.env.NODE_ENV}`,
           ignoreEnvFile: process.env.NODE_ENV === 'prod',
           validationSchema: Joi.object({
             NODE_ENV: Joi.string()
               .valid('dev', 'prod')
               .required(),
             DB_HOST: Joi.string().required(),
             DB_PORT: Joi.string().required(),
             DB_USERNAME: Joi.string().required(),
             DB_PASSWORD: Joi.string().required(),
             DB_DATABASE: Joi.string().required(),
           }),
         }),
         TypeOrmModule.forRoot({
           type: 'postgres',
           host: process.env.DB_HOST,
           port: +process.env.DB_PORT,
           username: process.env.DB_USERNAME,
           password: process.env.DB_PASSWORD,
           database: process.env.DB_DATABASE,
           synchronize: process.env.NODE_ENV !== 'prod',
           logging: true,
         }),
        ...
       ],
       ...
     })
     export class AppModule {}
     ```
4. TypeORM and Nest

   - restaurants entity 만들기

     - `@Entity()`는 데이터베이스 테이블에 매핑되는 클래스에 붙이는 decorator

     ```typescript
     // restaurant.entity.ts
     @ObjectType()
     @Entity()
     export class Restaurant {
       @PrimaryGeneratedColumn()
       @Field(type => Number)
       id: number;

       @Field(type => String)
       @Column()
       name: string;
     }
     ```

   - [Active Record vs Data Mapper](https://typeorm.io/#/active-record-data-mapper)
     - Data Mapper 패턴을 사용하는 이유
       - 큰 어플리케이션에서 유지보수에 효과적이다.
       - Repository 클래스에서 모든 쿼리 메서드를 정의해서, 테스트코드등 어디서든 접근하기 쉽다.
