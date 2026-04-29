import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch(err => {
  const safe = String(err).replace(/[\r\n]/g, ' ');
  console.error('Application failed to start:', safe);
});
