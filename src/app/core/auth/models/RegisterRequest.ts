import { Role } from '../enums/Role';

export interface RegisterRequest {
  email: string;
  password: string;
  role: Role;
  firstName: string;
  lastName: string;
  // phoneNumber: string;
  // address: string;
  dateOfBirth: string;
}
