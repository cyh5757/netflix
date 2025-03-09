import { Exclude, Expose, Transform } from "class-transformer";

// upper-case.transformer.ts
import { TransformFnParams } from "class-transformer";

export function toUpperCase({ value }: TransformFnParams): string {
  return value.toString().toUpperCase();
}



export class Movie {
    id: number;
    title: string;
    @Transform(toUpperCase)
    genre: string;
}