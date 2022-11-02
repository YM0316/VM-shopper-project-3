import { Component, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { DocumentLangType } from '@core/enum';

import { MenuItem, SelectItem } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.sass'],
})
export class MenubarComponent implements OnInit {
  items: MenuItem[];
  public DocumentLang = DocumentLangType;
  public langList: SelectItem<string>[] = [
    { value: DocumentLangType.ENG, label: 'English' },
    { value: DocumentLangType.CHS, label: '简体中文' },
    { value: DocumentLangType.CHT, label: '繁體中文' },
  ];
  public selectedLang: SelectItem<string> = this.langList[0];
  store: any;
  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly translate: TranslateService,
  ) {
    this.items = [
      {
        label: 'Home',
        routerLink: '/home',
      },
      {
        label: 'PlayGround',
        routerLink: '/playground',
      },
      // {
      //   label: 'Test',
      //   routerLink: '/test',
      // },
    ];
  }

  ngOnInit(): void { }

  public onLangSelect(key: DocumentLangType): void {
    this.bindLang(key);
  }

  private bindLang(key: DocumentLangType): void {
    this.document.documentElement.lang = key;
    this.selectedLang = this.langList.find((item) => item.value === key);
    this.translate.use(key);
  }
}
