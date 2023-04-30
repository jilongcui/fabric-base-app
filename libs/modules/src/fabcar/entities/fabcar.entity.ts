import { IsString } from "class-validator";

export class FabCar {
    @IsString()
    id: string
    @IsString()
    docType?: string;
    @IsString()
    color: string;
    @IsString()
    make: string;
    @IsString()
    model: string;
    @IsString()
    owner: string;
}
