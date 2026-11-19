import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withHashLocation } from '@angular/router';
import { AppComponent } from './app/app.component';
import { HomeComponent } from './app/home.component';
import { LessonComponent } from './app/lesson.component';

bootstrapApplication(AppComponent, {
  providers: [provideRouter([
    { path: '', component: HomeComponent, title: '課程地圖｜Teaching Assistant' },
    { path: 'lesson/:id', component: LessonComponent },
    { path: '**', redirectTo: '' },
  ], withHashLocation())],
}).catch(console.error);
