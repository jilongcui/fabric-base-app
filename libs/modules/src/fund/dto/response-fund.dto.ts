export class WebSignResponse {
    merch_id?: string
    out_trade_no: string
    out_trade_time: string
    sign_url: string
}

export class SendSMSResponse {
    agent_id?: number
    ret_code: string
    ret_msg: string
    hy_token_id: string
}

export class BankCertifyResponse {
    version: number
    agent_id?: number
    ret_code: string
    ret_msg: string
    encoding: string
    detail_data: string
    sign: string
}

export class PayResponse {
    ret_code?: string
    ret_msg: string
    sign: string
}

export class QueryBankCardResponse {
    agent_id?: number
    ret_code: string
    ret_msg: string
    bank_card_no: string
    bank_type: string
    bank_name: string
    bank_card_type: string
    sign: string
}

export class ConfirmPayResponse {
    agent_id?: number
    ret_code: string
    ret_msg: string
    hy_bill_no: string
}



