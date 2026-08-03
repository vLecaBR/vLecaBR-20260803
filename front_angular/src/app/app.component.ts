import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Raiz da aplicação — equivalente ao `App.tsx` do protótipo React. */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent {}
