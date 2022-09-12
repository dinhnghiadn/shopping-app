import { Image } from '../../models/entities/Image.entity';

export interface SuccessResponse {
  success: boolean;
  status: number;
  resources?: unknown[];
  resource?: unknown;
  image?: Image | null;
  images?: Image[] | null;
  message?: string;
  token?: string;
}

export interface ErrorResponse {
  success: boolean;
  status: number;
  message?: string;
}

export function isSuccessResponse(object: any): object is SuccessResponse {
  return object.success === true;
}
