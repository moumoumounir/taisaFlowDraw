import {  Component, OnInit } from '@angular/core';
import {MatDialogRef,MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-mat-conf',
  templateUrl: './mat-conf.component.html',
  styleUrls: ['./mat-conf.component.css']
})
export class MatConfComponent implements OnInit{
    constructor( 
        public dialogRef : MatDialogRef<MatConfComponent>
      
    ) { 
       
    }
     
    async ngOnInit(){
  
    
        
     }
            actionHandler1(event:any){
  
            console.log(' action handler event ',JSON.stringify(event))
            this.dialogRef.close({data:JSON.stringify(event)});
          }
    
  }
  
