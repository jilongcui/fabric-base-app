import { IsNumber, IsString } from "class-validator";
import { User } from "../entities/user.entity";

export class ResUserDto extends User {
    
}

/* 用户信息 */
export class ResUserInfoDto {
    /* 用户信息 */
    user?: ResUserDto

}