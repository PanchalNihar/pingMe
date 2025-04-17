import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { authGuard } from './services/auth.guard';
import { ProfileComponent } from './components/profile/profile.component';
import { LayoutComponent } from './components/layout/layout.component';
import { ViewProfileComponent } from './components/profile/view-profile/view-profile.component';
import { UserListComponent } from './components/users/user-list/user-list.component';
import { UserProfileComponent } from './components/users/user-profile/user-profile.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth/login',
    component: LoginComponent,
  },
  {
    path: 'auth/register',
    component: RegisterComponent,
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'chat',
        loadComponent: () =>
          import('./components/chat/chat-room/chat-room.component').then(
            (m) => m.ChatRoomComponent
          ),
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'profile/view',
        component: ViewProfileComponent,
      },
      {
        path: 'users',
        component: UserListComponent,
      },
      {
        path: 'users/:id',
        component: UserProfileComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo:'auth/login'
  },
];
