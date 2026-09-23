import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseTickerPipe implements PipeTransform {
  transform(value: string): string {
    const upper = value.toUpperCase();
    if (!/^[A-Z0-9]{4,6}$/.test(upper)) {
      throw new BadRequestException('Invalid ticker format');
    }
    return upper;
  }
}
