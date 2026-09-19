import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginRequest } from '../../../../core/auth/models/LoginRequest';
import { AuthService } from '../../../../core/auth/services/auth-service';
import { concatMap, map } from 'rxjs';
import { UserState } from '../../services/user-state';
import { Router } from '@angular/router';

@Component({
  imports: [ButtonModule, FormsModule, CardModule, ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly userState = inject(UserState);
  private readonly router = inject(Router);

  form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request: LoginRequest = this.form.getRawValue();

    this.authService
      .login(request)
      .subscribe({
        next: (user) => {
          this.userState.setUser(user);
          this.router.navigate(['/books']);
        },
        error: (err) => {
          console.log(err.message);
        },
      });
  }
}
