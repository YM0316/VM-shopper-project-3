// Angular
import { Component } from '@angular/core';
import { LanguageService } from '@core/service';

import * as trans from '@core/config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'DIGI.NG.ProjectTemplate';
  constructor(public readonly languageService: LanguageService) {
    this.languageService.loadTranslations(
      ...trans.ORIGIN_TRANSLATION,
    );
  }

  onLoading = (_event: boolean): void => {
    // this.logger.debug('onLoading:', [_event]);
  };
}
