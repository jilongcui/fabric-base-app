import { OmitType, PartialType } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { Contract } from "../entities/contract.entity";

export class CreateContractDto extends OmitType(Contract, ['id', 'createTime', 'collections'] as const) { }
export class UpdateAllContractDto extends Contract { }
export class UpdateContractDto extends PartialType(CreateContractDto) { }
export class ListContractDto extends PartialType(OmitType(Contract, ['collections'] as const)) { }
