import fs from 'fs'
import path from 'path'
import { credentials, apiURLs } from './Sources/Tradovate/apiHandler.js'

export function readEnv(filePath, func) {
    try {
        const resolvedPath = path.resolve(filePath)
        const envData = fs.readFileSync(resolvedPath, 'utf-8')

        envData.split(/\r?\n/).forEach((line) => {
            const trimmedLine = line.trim();

            switch(func) {
                case 0:
                    try {
                        if (!trimmedLine || !trimmedLine.includes('https://')) return;

                        const [key, value] = trimmedLine.split('=')
                        if (key && value !== undefined) {
                            process.env[key.trim()] = value.trim()

                            apiURLs[key.trim()] = value.trim()
                        } else {
                            console.warn('[Credentials Error] Undefined Line in .env File:', line)
                        }
                    } catch (e) {
                        console.error('[API URL Error] Unable to Parse URLs: ', e)
                    }
                    break;
                
                case 1:
                    try {
                        if (!trimmedLine || trimmedLine.startsWith('#')) return;
                        if (trimmedLine.includes('https://') || trimmedLine.includes('/')) return;

                        const [key, value] = trimmedLine.split('=')
                        if (key && value !== undefined) {
                            process.env[key.trim()] = value.trim()

                            credentials[key.trim()] = value.trim()
                        } else {
                            console.warn('[API URL Parsing Error] Undefined Line in .env File:', line)
                        }
                    } catch (e) {
                        console.error('[API URL Parsing Error] Unable to Parse URLs:', e)
                    }
                    break;
                
                default:
                    console.error('[readEnv Error] Unrecognized Argument Passed to readEnv:', func)
            }
        })
    } catch (e) {
        console.error('[readEnv Error] Unable to Process .env File. Check your File Path: ', filePath)
    }
}
