import { OmitType } from "@nestjs/swagger";
import { FabCar } from "../entities/fabcar.entity";

export class CreateFabcarDto extends OmitType(FabCar, ['docType'] as const) {}
