// Angular Core
import { Component, ViewChild, Input, AfterViewInit } from '@angular/core';
import { SimpleChanges, Injector, EmbeddedViewRef } from '@angular/core';
import { OnChanges, TemplateRef, Output, EventEmitter } from '@angular/core';
// Prime NG
import { Dialog } from 'primeng/dialog';
// Caloudi
import { BaseComponent } from '@base/base.component';

@Component({
  selector: 'prime-dialog',
  templateUrl: './prime-dialog.component.html',
  styleUrls: ['./prime-dialog.component.sass'],
})
export class PrimeDialogComponent extends BaseComponent implements OnChanges, AfterViewInit {

  /** Table Instance */
  @ViewChild('dialog') dialog: Dialog;

  @Input() class: string;
  /** Prime Ng Icon */
  @Input() icon: string;
  /** Using hex */
  @Input() iconColor: string;
  @Input() header: string;
  /** User custom dialog height */
  @Input() height: string;

  /** TODO: add height & width contorl */
  @Input() minHeight: string;
  @Input() minWidth: string;

  @Input('visible') displayDialog: boolean;
  @Output('visibleChange') displayDialogChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  /** Overwrite default */
  @Input() dismissableMask: boolean = true;
  @Input() focusOnShow: boolean = false;
  @Input() maximizable: boolean = false;
  @Input() blockScroll: boolean = true;
  @Input() draggable: boolean = false;
  @Input() resizable: boolean = false;
  @Input() closable: boolean = true;
  @Input() modal: boolean = true;

  @ViewChild('headerTemplate') headerTemplate: TemplateRef<HTMLElement>;
  @ViewChild('footerTemplate') footerTemplate: TemplateRef<HTMLElement>;
  @ViewChild('headerContent') headerContent: any;
  @ViewChild('footerContent') footerContent: any;
  public headerElement: EmbeddedViewRef<HTMLElement> = null;
  public footerElement: EmbeddedViewRef<HTMLElement> = null;

  constructor(
    public readonly injector: Injector,
  ) {
    super(injector);
  }

  /**
   * Change class when parent change it
   * @param changes SimpleChanges
   */
  public ngOnChanges(changes: SimpleChanges): void {
    // this.logger.debug('changes:', [changes]);
    this.class = changes.class?.currentValue;
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      const el: HTMLElement = document.querySelector('div.p-dialog-footer');
      this.headerElement = this.headerTemplate.createEmbeddedView(this.headerContent);
      this.footerElement = this.footerTemplate.createEmbeddedView(this.footerContent);
      // this.logger.debug('view:', [this.headerElement, this.footerElement, el]);
      if (this.footerElement?.rootNodes.length === 0) el.remove();
    }, 0);
  }

  public hideDialog(): void {
    // this.logger.debug('hide:', [this.displayDialog]);
    this.dialog.unbindGlobalListeners();
    this.displayDialogChange.emit(this.displayDialog);
  }
}
