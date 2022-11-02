import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'digi-menu-new',
  templateUrl: './menu-new.component.html',
  styleUrls: ['./menu-new.component.css']
})
export class MenuNewComponent implements OnInit {

  public isMenuCollapsed = true;

  constructor() { }
  
  ngOnInit(): void {
  }

}
