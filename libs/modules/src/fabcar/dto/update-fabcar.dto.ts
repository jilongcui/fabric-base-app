import { PartialType } from '@nestjs/swagger';
import { CreateFabcarDto } from './create-fabcar.dto';

export class UpdateFabcarDto extends PartialType(CreateFabcarDto) {}
