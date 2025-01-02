import { applyDecorators, UsePipes } from '@nestjs/common';
import { ZodSchema } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';

export const ZodValidation = (schema: ZodSchema) => {
  return applyDecorators(
    UsePipes(new ZodValidationPipe(schema)),
  );
};
