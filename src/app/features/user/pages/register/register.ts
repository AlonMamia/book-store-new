import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth/services/auth-service';
import { concatMap, tap } from 'rxjs';
import { Role } from '../../../../core/auth/enums/Role';
import { UserState } from '../../services/user-state';
import { Router } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-register',
  styleUrl: './register.scss',
  templateUrl: './register.html',
})
export class Register {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly userState = inject(UserState);
  private readonly router = inject(Router);

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

    const { email, password, confirmPassword, firstName, lastName, dateOfBirth } =
      this.registerForm.getRawValue();

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
      dateOfBirth,
      role: Role.USER,
    };

    this.authService
      .register(registerRequest)
      .pipe(
        concatMap(() => this.authService.login({ email, password })),
        tap((user) => {
          this.userState.setUser(user);
          this.router.navigate(['/books']);
        }),
      )
      .subscribe();
  }
}
