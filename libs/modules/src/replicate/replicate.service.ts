import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
// import {Replicate} from "replicate";

const Replicate = require("replicate");

@Injectable()
export class ReplicateService {

    logger = new Logger(ReplicateService.name)
    
    replicate= new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
        userAgent: "XiaoheAI/1.2.3",
    })

    constructor(
        // private readonly httpService: HttpService,
    ) {
    }
    async run(model, input) {
        const output = await this.replicate.run(model, {input: input});
        return output
    }
    
    // async get(prediction) {
    //     const remoteUrl = `https://replicate.com/api/models${prediction.version.model.absolute_url}/versions/${prediction.version_id}/predictions/${prediction.uuid}`
    //     const options ={
    //         headers: {
    //             "Content-Type": "application/json"
    //         },
    //     }
    //     let res = await this.httpService.axiosRef.get(remoteUrl, options);
    //     const responseData = res.data
    //     this.logger.debug(responseData)
    //     return responseData
    // }

    // async create(model, inputs) {
    //     const [path, version] = model.split(':')
    //     const remoteUrl = `https://api.replicate.com/v1/predictions`
    //     // const remoteUrl = `https://replicate.com/api/models/${path}/versions/${version}/predictions`
    //     this.logger.debug(remoteUrl)
    //     let options = {
    //         headers: {
    //             "Content-Type": "application/json"
    //         },
    //         body: {
    //             version: version,
    //             inputs: inputs
    //         }
    //     }
    //     let res = await this.httpService.axiosRef.post(remoteUrl, options);
    //     const responseData = res.data
    //     this.logger.debug(responseData)
    //     return responseData
    // }
}
