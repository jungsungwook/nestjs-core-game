import { CallHandler, ExecutionContext, HttpException, Injectable, InternalServerErrorException, NestInterceptor } from "@nestjs/common";
import { Observable, catchError, tap } from "rxjs";
import { QueryRunner, DataSource } from "typeorm";

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const queryRunner: QueryRunner = await this.dbInit();

    req.queryRunnerManager = queryRunner.manager;

    return next.handle().pipe(
      catchError(async (e) => {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();

        if (e instanceof HttpException) {
          throw new HttpException(e.message, e.getStatus());
        } else {
          throw new InternalServerErrorException(e.message);
        }
      }),
      tap(async () => {
        await queryRunner.commitTransaction();
        await queryRunner.release();
      }),
    );
  }

  private async dbInit(): Promise<QueryRunner> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    return queryRunner;
  }
}