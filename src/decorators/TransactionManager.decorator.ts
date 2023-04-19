import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const TransactionManager = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
      const req = ctx.switchToHttp().getRequest();
      return req.queryRunnerManager;
    },
  );