# Nuber Eats

The Backend of Nuber Eats Clone

1.  Backend Setup:
    - `nest g application` 로 프로젝트 시작하기
    - `nest g mo restaurants` 으로 restaurants 모듈 만들기
    - `git init` 깃 레파지토리 생성
2.  GraphQL Setup:

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

3.  Database Configuration
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
4.  TypeORM and Nest

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
        - NestJS에서 자동으로 Repository를 사용할 수 있도록 클래스에 알아서 준비해 준다.
        - Data Mapper 패턴을 이용해서 Repository 를 testgkrh simulate 해볼수있다.
    - Injecting The Repository

      ```typescript
      // restaurant.service.ts
      @Injectable()
      export class RestaurantService {
        constructor(
          @InjectRepository(Restaurant)
          private readonly restaurants: Repository<Restaurant>,
        ) {}
        getAll(): Promise<Restaurant[]> {
          return this.restaurants.find();
        }
      }
      ```

      ```typescript
      // restaurant.resolver.ts
      @Resolver(of => Restaurant)
      export class RestaurantsResolver {
        constructor(private readonly restaurantService: RestaurantService) {}

        @Query(returns => [Restaurant])
        restaurants(): Promise<Restaurant[]> {
          return this.restaurantService.getAll();
        }
      }
      ```

    - [Mapped Type](https://docs.nestjs.com/graphql/mapped-types#mapped-types)
      - Entity에 사용된 필드를 Dto로 사용하는 방법
        - patial: 모든 필드를 그대로 사용
        - pick: 필요한 필드만 선택하여 사용
        - omit: 선택한 필드를 제외한 나머지를 사용
        - intersection: 두가지 타입(엔티티)을 결합하여 사용

5.  User CRUD

    - `nest g mo users` 으로 users 모듈 만들기
    - `nest g mo common` common 모듈에 CoreEntity로 공통 컬럼 묶기

      - [TypeORM Special Columns](https://typeorm.io/#/entities/special-columns)
        - `@CreateDateColumn()`
        - `@UpdateDateColumn()`

      ```typescript
      // core.entity.ts
      export class CoreEntity {
        @PrimaryGeneratedColumn()
        id: number;

        @CreateDateColumn()
        createdAt: Date;

        @UpdateDateColumn()
        updatedAt: Date;
      }
      ```

      ```typescript
      // user.entity.ts
      @Entity()
      export class User extends CoreEntity {
        @Column()
        email: string;
        ...
      }
      ```

    - Hashing Passwords
      - `npm i bcrypt`, `npm i @types/bcrypt -D`: hash 관련 패키지
      - [TypeORM Entity Listeners and Subscribers](https://typeorm.io/#/listeners-and-subscribers)
        - `@BeforeInsert`이벤트로 Hashing Passwords 하기
        ```typescript
        // user.entity.ts
        export class User extends CoreEntity {
         ...
         @BeforeInsert()
         async hashPassword(): Promise<void> {
           try {
             this.password = await bcrypt.hash(this.password, 10);
           } catch (e) {
             throw new InternalServerErrorException();
           }
         }
        }
        ```

6.  USER AUTHENTICATION

    - 방법1: [Nestjs에서 제공하는 passport를 사용](https://docs.nestjs.com/security/authentication)
    - 방법2: [Module: jwt 모둘 직접 구현하기](https://docs.nestjs.com/modules)

           - [패키지 설치](https://www.npmjs.com/package/jsonwebtoken): `npm i jsonwebtoken`, `npm i -D @types/jsonwebtoken`
           - SECRET_KEY 환경변수 설정 ([RandomKeygen 사이트](https://randomkeygen.com/) CodeIgniter Encryption Keys 활용)
           - 모듈 생성: `nest g mo jwt`, `nest g s jwt`

             - static module
             - dynamic module
             - dependency injenction

               ```typescript
               // app.module.ts
               @Module({
                  imports: [
                    ConfigModule.forRoot({
                        /* ... */
                        SECRET_KEY: Joi.string().required(),
                      }),
                    }),
                    /* ... */
                  ]
                })
                export class AppModule {}
               ```

               ```typescript
               // user.module.ts
               @Module({
                 imports: [TypeOrmModule.forFeature([User]), ConfigService],
                 /* ... */
               })
               export class UsersModule {}
               ```

               ```typescript
               // user.service.ts
               @Injectable()
               export class UsersService {
                 constructor(
                   @InjectRepository(User)
                   private readonly config: ConfigService,
                 ) {}
                 /* ... */
                 async login({ email, password }: LoginInput): Promise<LoginOutput> {
                   // JWT 생성후 유저에게 주기
                   const token = jwt.sign(
                     { id: user.id },
                     this.config.get('SECRET_KEY'),
                   );
                   /* ... */
                 }
               }
               ```

           - [Middleware](https://docs.nestjs.com/middleware)

             ```typescript
             // jwt.middleware.ts
             @Injectable()
             export class JwtMiddleware implements NestMiddleware {
               /* ... */
               async use(req: Request, res: Response, next: NextFunction) {
                 if ('x-jwt' in req.headers) {
                   const token = req.headers['x-jwt'];
                   const decoded = this.jwtService.verify(token);
                   if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
                     try {
                       const user = await this.userService.findById(decoded['id']);
                       req['user'] = user;
                     } catch (e) {}
                   }
                 }
                 next();
               }
             }
             ```
              ```typescript
              // app.module.ts
              @Module({
                imports: [
                  /* ... */
                  JwtModule.forRoot({
                    privateKey: process.env.PRIVATE_KEY,
                  }),
                ],
                /* ... */
              })
              export class AppModule implements NestModule {
                configure(consumer: MiddlewareConsumer) {
                  consumer.apply(JwtMiddleware).forRoutes({
                    path: '*',
                    method: RequestMethod.ALL,
                  });
                }
              }
              ```
          - [GraphQL Context](https://github.com/apollographql/apollo-server#context)

            ```typescript
            // app.module.ts
            @Module({
              imports: [
                /* ... */
                GraphQLModule.forRoot({
                  autoSchemaFile: true,
                  context: ({ req }) => ({ user: req['user'] }),
                }),
                JwtModule.forRoot({
                  privateKey: process.env.PRIVATE_KEY,
                }),
              ],
              /* ... */
            })
            export class AppModule implements NestModule {
              /* ... */
            }
            ```

            ```typescript
            // user.resolver.ts
            @Resolver(of => User)
            export class UserResolver {
              /* ... */
              @Query(returns => User)
              me(@Context() context) {
                if (!context.user) {
                  return;
                } else {
                  return context.user;
                }
              }
            }
            ```
