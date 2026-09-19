import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth/services/auth-service';
import { forkJoin, tap } from 'rxjs';
import { Role } from '../../../../core/auth/enums/Role';
import { Utils } from '../../../../shared/utils/utils';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-register',
  styleUrl: './register.scss',
  templateUrl: './register.html',
})
export class Register {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly registerForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    dateOfBirth: [new Date(), [Validators.required]],
  });

  get email() {
    return this.registerForm.controls.email;
  }

  get password() {
    return this.registerForm.controls.password;
  }

  get confirmPassword() {
    return this.registerForm.controls.confirmPassword;
  }

  get firstName() {
    return this.registerForm.controls.firstName;
  }

  get lastName() {
    return this.registerForm.controls.lastName;
  }

  get dateOfBirth() {
    return this.registerForm.controls.dateOfBirth;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { email, password, confirmPassword, firstName, lastName, dateOfBirth } = this.registerForm.getRawValue();

    if (password !== confirmPassword) {
      this.confirmPassword.setErrors({
        passwordMismatch: true,
      });
      return;
    }

    // confirmPassword לא נשלח לשרת.
    const registerRequest = {
      email,
      password,
      firstName,
      lastName,
      dateOfBirth: Utils.formatDateForApi(dateOfBirth),
      role: Role.USER
    };

    this.authService.register(registerRequest).subscribe(() => {
      console.log('register request successfully');
    });
  }
}
