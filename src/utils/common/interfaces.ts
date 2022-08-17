import {User} from "../../models/entities/User.entity";

export interface SuccessResponse {
    success:boolean,
    status: number
    resources?: Array<unknown>;
    resource?: unknown;
    message?: string
    token?: string
}

export function isSuccessResponse(object:any): object is SuccessResponse{
    return object.success === true
}

export interface ErrorResponse {
    success:boolean,
    status: number
    message?: string
}
