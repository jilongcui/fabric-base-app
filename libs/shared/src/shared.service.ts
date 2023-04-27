/*
 * @Author: Sheng.Jiang
 * @Date: 2021-12-08 17:14:57
 * @LastEditTime: 2022-05-05 16:00:15
 * @LastEditors: Please set LastEditors
 * @Description: 公共方法
 * 
 * @FilePath: \meimei-admin\src\shared\shared.service.ts
 * You can you up，no can no bb！！
 */

import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import * as CryptoJS from 'crypto-js';
import { createCipheriv, createDecipheriv, createHash } from 'crypto'
import { customAlphabet, nanoid } from 'nanoid';
import { Request } from 'express'
import axios from 'axios';
import * as iconv from 'iconv-lite'
import { CAPTCHA_IMG_KEY } from '@app/common/contants/redis.contant';
import { isEmpty } from 'lodash';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { ApiException } from '@app/common/exceptions/api.exception';
import { generateKeyPairSync, publicEncrypt } from 'crypto';
import strRandom from 'string-random';
const fs = require("fs");
const xml2js = require('xml2js');
const parser = new xml2js.Parser({
    explicitArray: false
});

@Injectable()
export class SharedService {
    logger = new Logger(SharedService.name)
    constructor(
        @InjectRedis() private readonly redis: Redis,
    ) { }
    /**
     * 构造树型结构数据
     */
    public handleTree(data: any[], id?: string, parentId?: string, children?: string) {
        let config = {
            id: id || 'id',
            parentId: parentId || 'parentId',
            childrenList: children || 'children'
        };

        var childrenListMap = {};
        var nodeIds = {};
        var tree = [];

        for (let d of data) {
            let parentId = d[config.parentId];
            if (childrenListMap[parentId] == null) {
                childrenListMap[parentId] = [];
            }
            nodeIds[d[config.id]] = d;
            childrenListMap[parentId].push(d);
        }

        for (let d of data) {
            let parentId = d[config.parentId];
            if (nodeIds[parentId] == null) {
                tree.push(d);
            }
        }

        for (let t of tree) {
            adaptToChildrenList(t);
        }

        function adaptToChildrenList(o) {
            if (childrenListMap[o[config.id]] !== null) {
                o[config.childrenList] = childrenListMap[o[config.id]];
            }
            if (o[config.childrenList]) {
                for (let c of o[config.childrenList]) {
                    adaptToChildrenList(c);
                }
            }
        }
        return tree;
    }


    /* 获取请求IP */
    getReqIP(req: Request): string {
        return (
            // 判断是否有反向代理 IP
            (
                (req.headers['x-forwarded-for'] as string) ||
                // 判断后端的 socket 的 IP
                req.socket.remoteAddress ||
                ''
            ).replace('::ffff:', '')
        );
    }

    /* 判断IP是不是内网 */
    IsLAN(ip: string) {
        ip.toLowerCase();
        if (ip == 'localhost') return true;
        var a_ip = 0;
        if (ip == "") return false;
        var aNum = ip.split(".");
        if (aNum.length != 4) return false;
        a_ip += parseInt(aNum[0]) << 24;
        a_ip += parseInt(aNum[1]) << 16;
        a_ip += parseInt(aNum[2]) << 8;
        a_ip += parseInt(aNum[3]) << 0;
        a_ip = a_ip >> 16 & 0xFFFF;
        return (a_ip >> 8 == 0x7F || a_ip >> 8 == 0xA || a_ip == 0xC0A8 || (a_ip >= 0xAC10 && a_ip <= 0xAC1F));
    }

    /* 通过ip获取地理位置 */
    async getLocation(ip: string) {
        if (this.IsLAN(ip)) return '内网IP'
        try {
            let { data } = await axios.get(`http://whois.pconline.com.cn/ipJson.jsp?ip=${ip}&json=true`, { responseType: "arraybuffer" })
            data = JSON.parse(iconv.decode(data, 'gbk'))
            return data.pro + ' ' + data.city;
        } catch(error) {
            return 'Unknown'
        }
    }

    /* 通过ip获取地理位置 */
    async getGlobalLocation(ip: string) {
        // this.logger.debug(ip)
        if (this.IsLAN(ip)) return '内网IP'
        try {
            const ips = ip.split(',')
            let {data} = await axios.get(`http://ip-api.com/json/${ips[0]}?lang=zh-CN`)
            // this.logger.debug(data)
            return data.country + ' ' + data.city;
        } catch (error) {
            this.logger.debug(error)
            return 'Unknown'
        }
        
    }

    /**
     * @description: AES加密
     * @param {string} msg
     * @param {string} secret
     * @return {*}
     */
    aesEncrypt(msg: string, secret: string): string {
        return CryptoJS.AES.encrypt(msg, secret).toString();
    }

    /**
     * @description: AES解密
     * @param {string} encrypted
     * @param {string} secret
     * @return {*}
     */
    aesDecrypt(encrypted: string, secret: string): string {
        return CryptoJS.AES.decrypt(encrypted, secret).toString(CryptoJS.enc.Utf8);
    }

    aesEncryptNoSalt(msg: string, secret: string): string {
        const iv = { words: [ 0, 0, 0, 0 ], sigBytes: 16, concat: null, clamp: null, clone: null}
        return CryptoJS.AES.encrypt(msg, CryptoJS.enc.Utf8.parse(secret), { iv:iv }).toString()
    }

    aesDecryptNoSalt(encrypted: string, secret: string): string {
        const iv = { words: [ 0, 0, 0, 0 ], sigBytes: 16, concat: null, clamp: null, clone: null}
        return CryptoJS.AES.decrypt(encrypted, CryptoJS.enc.Utf8.parse(secret), { iv }).toString(CryptoJS.enc.Utf8)
        // return CryptoJS.AES.decrypt(encrypted, secret, {iv: iv}).toString(CryptoJS.enc.Utf8);
    }

    /**
     * @description: md5加密
     * @param {string} msg
     * @return {*}
     */
    md5(msg: string): string {
        return CryptoJS.MD5(msg).toString();
    }

    md5Sign(msg: string) {
        // 加入字符编码
        var md5 = createHash('md5').update(msg, 'utf-8').digest('hex');
        return md5;
    }
    /**
     * @description: 生成一个UUID
     * @param {*}
     * @return {*}
     */
    generateUUID(): string {
        return nanoid();
    }

    tripleDesEncryptBuff(msg: any, key: string): string {
        const iv = null
        const alg = 'des-ede3'
        const cipher = createCipheriv(alg, key, iv);
        cipher.setAutoPadding(true)
        let ciph = cipher.update(msg)
        let ciphStr = ciph.toString('hex') + cipher.final('hex')
        return ciphStr
    }

    tripleDesEncrypt(msg: string, key: string): string {
        const iv = null
        const alg = 'des-ede3'
        const cipher = createCipheriv(alg, key, iv);
        cipher.setAutoPadding(true)
        let ciph = cipher.update(msg, 'utf8', 'hex')
        ciph += cipher.final('hex')
        return ciph.toUpperCase()
    }

    // 3Des-ECB
    tripleDesEcbDecrypt(data: string, key: string): string {
        const iv = null
        const alg = 'des-ede3'
        const decipher = createDecipheriv(alg, key, iv);
        decipher.setAutoPadding(true)
        let text = decipher.update(data, 'utf8', 'hex')
        text += decipher.final('hex')
        return text
    }

    // 3Des-CBC
    tripleDesCBCEncrypt(msg: string, key: string, iv: string): string {
        const alg = 'des-ede3-cbc'
        const cipher = createCipheriv(alg, key, iv);
        cipher.setAutoPadding(true)
        let ciph = cipher.update(msg, 'utf8', 'hex')
        ciph += cipher.final('hex')
        return ciph
    }

    // 3Des-CBC
    tripleDesCBCDecrypt(data: string, key: string, iv: string): string {
        const alg = 'des-ede3-cbc'
        const decipher = createDecipheriv(alg, key, iv);
        decipher.setAutoPadding(true)
        let text = decipher.update(data, 'utf8', 'hex')
        text += decipher.final('hex')
        return text
    }

    /**
     * @description: 生成随机数
     * @param {number} length
     * @param {*} placeholder
     * @return {*}
     */
    generateRandomValue(length: number, placeholder = '1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM',): string {
        const customNanoid = customAlphabet(placeholder, length);
        return customNanoid();
    }

    generateNonce(length: number) {
        return strRandom(length, {letters: false})
    }

    generateOrderNo(length: number) {
        return strRandom(length, {letters: false})
    }

    async checkImageCaptcha(uuid: string, code: string) {
        const cacheCode = await this.redis.get(`${CAPTCHA_IMG_KEY}:${uuid}`)
        if (isEmpty(cacheCode) || code.toLowerCase() !== cacheCode.toLowerCase())
            return false
        await this.redis.del(`${CAPTCHA_IMG_KEY}:${uuid}`)
        return true
    }

    compactJsonToString(data: Object) {
        let sign = '';
        for (let key in data) {
            if(data[key] != undefined)
                sign += '&' + key + '=' + data[key]
        }
        return sign.slice(1)
    }
    getPublicX905FromString(str: string) {
        const rawcert = this.stringChunks(str, 64)
        const cert = "-----BEGIN CERTIFICATE-----\n" + rawcert + "\n-----END CERTIFICATE-----";
        return cert
    }

    getPublicPemFromString(str: string) {
        const rawcert = this.stringChunks(str, 64)
        const cert = "-----BEGIN PUBLIC KEY-----\n" + rawcert + "\n-----END PUBLIC KEY-----";
        return cert
    }

    getPrivateFromString(str: string) {
        const rawcert = this.stringChunks(str, 64)
        const cert = "-----BEGIN PRIVATE KEY-----\n" + rawcert + "\n-----END PRIVATE KEY-----";
        return cert
    }

    stringChunks(str, chunkSize) {
        chunkSize = (typeof chunkSize === "undefined") ? 140 : chunkSize;
        let resultString = "";

        if (str.length > 0) {
            let resultArray = [];
            let chunk = "";
            for (let i = 0; i < str.length; i = (i + chunkSize)) {
                chunk = str.substring(i, i + chunkSize);
                if (chunk.trim() != "") {
                    resultArray.push(chunk);
                }
            }
            if (resultArray.length) {
                resultString = resultArray.join("\n");
            }
        } else {
            resultString = str;
        }

        return resultString;
    }

    // Creating a function to encrypt string
    encryptString(plaintext, publicKeyFile) {
        const publicKey = fs.readFileSync(publicKeyFile, "utf8");
        // publicEncrypt() method with its parameters
        const encrypted = publicEncrypt(
            publicKey, Buffer.from(plaintext));
        return encrypted.toString("base64");
    }

    // Using a function generateKeyFiles
    generateKeyFiles() {
        const keyPair = generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
                cipher: 'aes-256-cbc',
                passphrase: ''
            }
        });

        // Creating public key file 
        fs.writeFileSync("./public_key", keyPair.publicKey);
        fs.writeFileSync("./private_key", keyPair.privateKey);
    }

    // Get bank type from bank name
    getBankType(bankName: string) {
        if (bankName.search('工商') >= 0) return ['1', '#B12117,#9D180D']
        if (bankName.search('建设') >= 0) return ['2', '#3766C9,#2954B1']
        if (bankName.search('农业') >= 0) return ['3', '#B12117,#9D180D']
        if (bankName.search('中国银行') >= 0) return ['4', '#B12117,#9D180D']
        if (bankName.search('交通') >= 0) return ['5', '#284879,#172945']
        if (bankName.search('招商') >= 0) return ['6', '#CD2C2F,#C52A2D']
        if (bankName.search('兴业') >= 0) return ['7', '#153A73,#102E5D']
        if (bankName.search('邮政') >= 0) return ['8', '#295E34,#285E34']
        if (bankName.search('中信') >= 0) return ['9', '#295E34,#285E34']
        if (bankName.search('民生') >= 0) return ['10', '#4AA495,#24569C']
        if (bankName.search('其它') >= 0) return ['11', '#AB14AF-#7149CE']
    }

    bankBgColor = {
        "ICBC": '#B12117,#9D180D',
        "CCB": '#3766C9,#2954B1',
        "ABC": '#B12117,#9D180D',
        "BOC": '#B12117,#9D180D',
        "BC": '#284879,#172945',
        "CMB": '#CD2C2F,#C52A2D',
        "CIB": '#153A73,#102E5D',
        "PSBC": '#295E34,#285E34',
        "CITIC": '#295E34,#285E34',
    }

    // Get bank type from bank name
    getBankBgColor(bankType: string) {
        if (this.bankBgColor[bankType] !== undefined) {
            return this.bankBgColor[bankType]
        }
        return '#AB14AF-#7149CE'
    }

    async xmlToJson<T>(data: string): Promise<T> {
        const res = await new Promise<T>((resolve, reject) => {
            parser.parseString(data, function (err, result) {
                if (result) {
                    resolve(result.root)
                }
            });
        })
        return res
    }

    // Shuffles array in place. ES6 version
    shuffle(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    sortObject(obj: Object) { 
        //先用Object内置类的keys方法获取要排序对象的属性名，再利用Array原型上的sort方法对获取的属性名进行排序，newkey是一个数组
        var newkey = Object.keys(obj).sort();
        //console.log('newkey='+newkey);
        let newObj: any = {}; //创建一个新的对象，用于存放排好序的键值对
        for(var i = 0; i < newkey.length; i++) {
            //遍历newkey数组
            newObj[newkey[i]] = obj[newkey[i]]; 
            //向新创建的对象中按照排好的顺序依次增加键值对
        }
        return newObj; //返回排好序的新对象
    }

    async imageToBase64(url: string) {
        this.logger.debug(url)
        let { data } = await axios.get(url, { responseType: "arraybuffer" })
        return "data:image/png;base64," + Buffer.from(data, 'binary').toString('base64')
    }
}
