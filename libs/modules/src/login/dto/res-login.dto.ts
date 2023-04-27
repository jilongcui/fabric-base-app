import { User } from "../../user/entities/user.entity"

export class ResImageCaptchaDto {
    /* base64图片编码 */
    img: string

    /* uuid码 */
    uuid: string
}

export class ResLoginDto {
    /* token密匙 */
    token: string
}

export class ResInfo {
    /* 用户信息 */
    user: User
}