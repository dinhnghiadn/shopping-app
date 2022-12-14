export enum Role {
  User = 'USER',
  Admin = 'ADMIN',
}
export enum Gender {
  Male = 'MALE',
  Female = 'FEMALE',
}
export enum Owner {
  User = 'USER',
  Product = 'PRODUCT',
  Category = 'CATEGORY',
}

export enum UserStatus {
  Active = 'ACTIVE',
  NotVerified = 'NOT_VERIFIED',
  Inactive = 'INACTIVE',
  Blocked = 'BLOCKED',
}

export enum PaymentMethod {
  Cash = 'CASH',
  Visa = 'VISA',
}

export enum OrderStatus {
  NotConfirmed = 'NOT_CONFIRMED',
  Pending = 'PENDING',
  Completed = 'COMPLETED',
  Cancelled = 'CANCELLED',
}

export enum SessionStatus {
  Pending = 'PENDING',
  Success = 'SUCCESS',
  Cancelled = 'CANCELLED',
}
