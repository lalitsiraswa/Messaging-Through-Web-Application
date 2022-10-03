import {forgetPasswordBody} from "./ForgetPasswordBody"

export type forgetPasswordResponse = {
    status: String,
    message: String,
    payload: forgetPasswordBody[]
}