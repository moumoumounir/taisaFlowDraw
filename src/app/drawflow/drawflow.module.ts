import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawflowComponent } from './drawflow/drawflow.component';
import { MaterialModule } from '../material/material.module';
//import { AppModule } from '../app.module'

@NgModule({
  declarations: [
    DrawflowComponent
  ],
  imports: [
    CommonModule, MaterialModule //, AppModule
  ],
  exports:[DrawflowComponent]
})
export class DrawflowModule { }
