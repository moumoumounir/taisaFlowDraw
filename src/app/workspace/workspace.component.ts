import swal from 'sweetalert2';
import { EchangeData } from 'src/app/_interface/EchangeData';
import { EchangeDataConf } from 'src/app/_interface/EchangeDataConf'
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Component, ViewChild, OnInit , AfterViewInit} from "@angular/core";
import { cloneDeep } from 'lodash';
import { RunCodeService } from '../services/run-code.service';
import { PlotComponent } from '../plot/plot.component';
import { BehaviorService } from '../shared/behavior.service';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { SaveComponent } from 'src/app/save/save.component';
import { FileTreeComponent } from 'src/app/components/file-tree/file-tree.component';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { DrawflowComponent } from '../drawflow/drawflow/drawflow.component';

@Component({
selector: 'app-workspace',
templateUrl: './workspace.component.html',
styleUrls: ['./workspace.component.css']
})
export class WorkspaceComponent implements OnInit, AfterViewInit {

  executionLogs: string[] = []; // Store logs or updates
  isProcessing: boolean = false; // Flag to track execution state
  public selectedButton = '';
  public exceptionCode=0
  public lastExecusionIdModule='';
  public systemSelectedValue="";
  public extend="=";
  public reduce="-";
  public langage="Python";

  //public modules: any[]; //all modules
  public  message: []=[];
  myDate: Date = new Date();
  stringDate: string;
  public logInfoFlag=true
  public logInfoFlagGo=false
  public statDataDf:any[]=[] 
  private runServiceSubscription: Subscription | null = null;
  public jobId:string='';


  
  constructor(public matDialog: MatDialog,
    private runCodeService:RunCodeService,
    public send: BehaviorService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private formBuilder: FormBuilder
  ) { 
    this.subscription = new Subscription();
    this.stringDate = this.myDate.getFullYear() + '-' + (this.myDate.getMonth()+1) + '-' + ('0' + this.myDate.getDate()).slice(-2) ;
  
  }
    @ViewChild(DrawflowComponent, { static: false }) childEditor!: DrawflowComponent;

  drawflow :any={}
  subscription: Subscription;
  intervalId: number=0;

plateformForm = this.formBuilder.group({
  plateform: ['SQL'],
});
  public index: number = -1;


  title = ""
  public shipsInBoard: any[] = [];
  public projectConf:any={}
   public linkOne = ''
  public shipColor = ''
  public paletteBar = false
  public  image = new Image();
  public user:string="";

  public shitImage="assets/Close.svg"
  public shitImage1="assets/icon_search.svg"

  public spinerSelectedField =false;
  //public modules: any[]; //all modules
  public moduleToDo = []; //droped modules
  public barMenuFlag=true;
  public logFileBaseName='log_local_selfAnalytics'
  public logFileName='log_local_selfAnalytics'
 
  data=[]

  echangeData : EchangeData ={displayedColumns:[],data:[],actionColumns:[],actionButton:[],type:'df'}

  echangeDataConf : EchangeDataConf={displayedColumns:[],data:[],actionColumns:[],selectedRows:[]}


  mycurrentIndex = 0

  onPlateformChange(event:any){ 
    console.log(' onPlateformChange ',event.value)   
    this.projectConf['langage']=event.value
    this.childEditor.updateModulePanel(event.value)
  }
 
  isValid = 0;

  ngOnInit() {
    this.isValid = this.isValidPlot();
    //this.send.SendMonotoring.subscribe((data:any) => {
    //
    //});
   
   this.image.src = '';
    const userString=localStorage.getItem('user') ;
    if ( userString !== null ) this.user=userString 
 
   
   // console.log('thing rooooooooooooooooooooooooooooooooote ', this.activeRoute.snapshot.params.projectName);
    const dataSt = localStorage.getItem('data')!;
    const userData = localStorage.getItem('userData')!;
    ///////////////////////////////////////
    if (this.activeRoute.snapshot.params['projectName'] != undefined) {
      let fileName = this.user + ':' + this.activeRoute.snapshot.params['projectName'];
      this.runCodeService.getProjectContent(fileName).subscribe(
        content => {
          console.log(fileName, ' project content ', content.content.data)
          this.drawflow=content.content.drawflow
 
        }, error => {
          console.log(" project don't found ");
          alert(" project don't found ")

        }
      );
    } else
    
    if (dataSt !== null) {
      this.shipsInBoard = JSON.parse(dataSt);
      this.drawflow=JSON.parse(userData);

        //this.buildNarrow();
        if (localStorage.getItem('projectConf') != undefined && localStorage.getItem('projectConf')) {
          this.projectConf = JSON.parse(localStorage.getItem('projectConf')!)
          this.langage = this.projectConf['langage']
          console.log(' this.projectConf  ', JSON.stringify(this.projectConf))
          this.plateformForm.controls['plateform'].setValue(this.langage)
        }
        this.send.SendProject.next(this.projectConf);
        //this.childC.updateProject()
      } 
    
    //////////  Init Plateforme Buttom SQL or Python
    if (this.projectConf['langage'] != undefined) {
      this.plateformForm.controls['plateform'].setValue(this.projectConf['langage'])
    }
    else {
      this.plateformForm.controls['plateform'].setValue('Python')
    }
    this.childEditor.updateModulePanel(this.plateformForm.controls['plateform'].value!)
      
  }

ngAfterViewInit() {
  console.log(' ngAfterViewInit ')
}

  showPlot(){
  const indexOfInvalid=this.getInvalidModule();
  if (indexOfInvalid >=0 ) {

    alert(' pipe line is Invalid check config file for all noeud: '+this.shipsInBoard[indexOfInvalid]['action'])
    return 0
  }
  this.shipsInBoard=this.childEditor.transformEditorToShipBoard();
  this.spinerSelectedField = true;
    this.echangeData.data = []
    this.echangeData.actionColumns=[]
    if (!this.checkUnlinkedObject()) {
      this.selectedButton = 'plot';
      const pipeObject = this.partialPipeObject();
      ////console.log(' getPlotImgBase64 ',pipeObject)
      const pipeProject = { logFile:this.logFileName,user:localStorage.getItem('user'), langage:this.plateformForm.controls['plateform'].value, pipeObject:pipeObject}
      this.runCodeService.getPlotImgBase64(pipeProject).subscribe(
        resultat => {

          this.image.src = "data:image/jpg;base64," + resultat[0].data;
          this.openPlotModal(this.image.src);
          this.echangeData.data = [{}]
          this.spinerSelectedField = false;
        });

    }
    else
      alert(' Pipe line Invalide : unlinked Object ')
    return 0;
    }

 formatCode(data : any[]){
  //to be verified
  //data.sort(this.GetSortOrder("rank"));
  var jdata=[]
  for (var item in data){
    for (var el in data[item].code){
      if ( !data[item].code[el].includes('root_logger') && !data[item].code[el].includes('handler') )
      
      jdata.push({'code':data[item].code[el]})
    }

  }
  return jdata;
 }

  showCode(){
  this.selectedButton='Design'
  this.echangeData.data=[]
  this.echangeData.type='code'
  this.echangeData.actionColumns=['Download']
  if ( !this.checkUnlinkedObject() ){
  
  const pipeObject=this.partialPipeObject();
  const pipeProject = { logFile:this.logFileName,user:localStorage.getItem('user'),langage:this.plateformForm.controls['plateform'].value, pipeObject:pipeObject}
  console.log('pipeObject ',JSON.stringify(pipeObject))
  this.runCodeService.executePipeGetCode(pipeProject).subscribe(
      resultat => {
        console.log(' executePipeGetCode ',JSON.stringify(resultat))
        console.log(' executePipeGetCode ',resultat[0])
        this.selectedButton='run';
        this.data=resultat;
        console.log(' data ',this.data)
        if (this.plateformForm.controls['plateform'].value=='SQL'){

          
          resultat.push({'code':resultat[0]['query'].replace(/~/g,'\'')})
          //resultat[0]['code']=resultat[0]['query'].replace(/~/g,'\'')
          resultat.shift()
          this.echangeData.data=resultat;
          this.echangeData.type ='code'
        }else {
        this.echangeData.data=this.formatCode(this.data)
        }
        console.log(' executePipeGetCode ',this.echangeData.data)

        //this.echangeData.data=this.data
      },
      error => console.log(' debug my error ',error) 
      
    );
  }
    else 
    alert(' Pipe line Invalide : unlinked Object ')
  }

  getInvalidModule(){
    //const pipeObject=this.partialPipeObject();
    const plotObjectIndex=this.shipsInBoard.findIndex((el : any) => this.isValidModule(el)==0)
    return plotObjectIndex
  
    }

  isValidModule(module:any){
    //const pipeObject=this.partialPipeObject();
    console.log(' isValidModule  ',module['form'])
    const form=module['form']
    
    var ar=[]
    if ( module['columns'] != undefined){
    let columns= module['columns']
    if (columns.map((el : any) => el.includes('error_class')).includes(true)) {
       //ar.push('error_class')
       console.log(' columns ffffff 11111 ffffffffff   ',columns)
    }

    }

    for (var key in form){
      console.log(key,'    ',form[key],' ffffffffffffffff  form key ',form[key].value)
      if (form[key].value.toString() == '' && (module['action']) !='select')
        ar.push(key)
      }
   
    console.log(' invalid fffffff 222222 fffffffff  error array  ',ar)
    if (ar.length == 0) {
      //alert(' Cannot  run Plot Pipe line  : select pipe without plot ')
      return 1
    } else
      return 0
  }
  

  isValidPlot(){
  //const pipeObject=this.partialPipeObject();
  if ( this.childEditor ===undefined || this.childEditor.transformEditorToShipBoard() ===undefined) return 0
   this.shipsInBoard=this.childEditor.transformEditorToShipBoard();
 
  
  const plotObjectIndex=this.shipsInBoard.findIndex((el : any) => el.action.includes('plot'))
  ////console.log(' isVVVVVVVVVVVVVVVVVVValidPlot  ',plotObjectIndex)
  if ( plotObjectIndex == -1 || this.linkOne !=''){
    //alert(' Cannot  run Plot Pipe line  : select pipe without plot ')
     return 0
  }else 
    return 1
  }
  updates: any[] = [];



   sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  checkNodeConfiguration(){
    const checkConf:any=this.childEditor.checkNodeConfiguration();
    console.log(checkConf.length," Check Noeud Are not well configured "+JSON.stringify(checkConf))
    if ( checkConf.length >0  ) {
      alert(" Noeud Are not well configured "+JSON.stringify(checkConf))
      return 0
    }
    else return 1

  }
///////////////2025
  // Start the service call
  runService() {
    this.selectedButton = 'Design';
    this.childEditor.removeAllSelectNode();
    if ( this.checkUnlinkedObject() || this.checkNodeConfiguration()===0) return 0
    if ( this.isValidPlot() ){
      //this.spinerSelectedField = true;
      this.showPlot();
      return 0

    }else {
    this.echangeData.data = [];
  
    const editorData = JSON.stringify(this.childEditor.geteditorData());
    const userData = localStorage.getItem('userData');
  
    console.log("Editor Data:", editorData);
    console.log("User Data:", userData);
  
    this.shipsInBoard = this.childEditor.transformEditorToShipBoard();
    const indexOfInvalid = this.getInvalidModule();
  
    if (indexOfInvalid >= 0 ) {
      console.warn("Invalid module detected at index:", indexOfInvalid);
     // return 1; // Changed to exit if an invalid module is found.**
    }
  
    this.spinerSelectedField = true; // **Red Color Change: Start spinner when execution begins.**
    this.echangeData.type = 'df';
    this.echangeData.actionColumns = ['Download'];
  
    const pipeObject = this.partialPipeObject();
    //const plotObject = pipeObject.find((el: any) => el.action.includes('plot'));
  
    console.log("Pipe Object:", pipeObject);
  
    this.stringDate = this.myDate.getFullYear() + this.myDate.getMonth() +
      ('0' + this.myDate.getDate()).slice(-2) +
      this.myDate.getHours() + this.myDate.getMinutes() +
      this.myDate.getSeconds() + this.myDate.getUTCMilliseconds();
  
    this.logFileName = `${this.logFileBaseName}_${this.stringDate}`;
    this.childEditor.monotoringFlow(this.logFileName);
  
    this.logInfoFlagGo = true;
    this.jobId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  
    const pipeProject = {
      jobId: this.jobId,
      logFile: this.logFileName,
      user: localStorage.getItem('user'),
      langage: this.plateformForm.controls['plateform'].value,
      pipeObject: pipeObject
    };
  
    this.runServiceSubscription = this.runCodeService.executePipeGetDf(pipeProject).subscribe(
      (result) => {
        this.data = result;
        console.log("Execution result count:", result.length);
  
        if (result.length > 0) {
          this.echangeData.data = result; // **Red Color Change: Assign results to the table.**
          this.selectedButton='run'
        }
      },
      (error) => {
        console.error("Error during execution:", error);
      },
      () => {
        console.log("Execution completed.");
        this.spinerSelectedField = false; // **Red Color Change: Stop spinner after completion.**
        //this.selectedButton='Design'
      }
    );
    }
    return 1
  }
  
  cancelExecution() {
    if (this.runServiceSubscription) {
      this.runServiceSubscription.unsubscribe();
      this.runServiceSubscription = null;
  
      this.runCodeService.cancelJob(this.jobId).subscribe(
        (response) => {
          console.log("Job canceled:", response);
        },
        (error) => {
          console.error("Error canceling job:", error);
        }
      );
  
      this.spinerSelectedField = false; // **Red Color Change: Stop spinner immediately when canceled.**
      this.echangeData.data = []; // **Red Color Change: Clear data table when execution is stopped.**
      this.selectedButton='Design'
      console.log("Execution canceled.");
    }
  }
  

  async  executePipeGetColStat(): Promise<any> {
    var statData:any[]=[]
    var importedData:any[]=[] // {'released': {"Yes":4334,"No":892}}, {'colour': {"White":3938,"Black":1288}}, {'year': {"2000":1270,"2001":1211,"1999":1099,"1998":877,"1997":492,"2002":277}}, {'age': {"18":476,"19":473,"17":443,"20":398,"21":382,"16":307,"22":287,"23":240,"24":219,"15":202}}, {'sex': {"Male":4774,"Female":442,"nan":10}}, {'employed': {"Yes":4111,"No":1115}}, {'citizen': {"Yes":4455,"No":771}}, {'checks': {"0":1851,"3":953,"1":854,"2":789,"4":643,"5":127,"6":9}}];
    const pipeProject = { logFile:this.logFileName,user:localStorage.getItem('user'),langage:this.plateformForm.controls['plateform'].value, pipeObject:this.shipsInBoard}
     
    try {
          const response = await firstValueFrom(this.runCodeService.executePipeGetColStat(pipeProject));
      console.log(" collect ",JSON.stringify(response))
          return importedData;
    } catch (error) {
      console.error('Error updating JSON data:', error);
      throw error;
    }



  }

  async showColStat(){
    if (!this.checkUnlinkedObject()) {

    var statData:any[]=[];
    var importedData:any[]=[] 
    const pipeProject = { logFile:this.logFileName,user:localStorage.getItem('user'),langage:this.plateformForm.controls['plateform'].value, pipeObject:this.shipsInBoard}
        
    let response =await this.executePipeGetColStat();
    //this.statDataDf = response[0];
    //console.log(' executePipeGetColStat ',JSON.stringify(this.statDataDf));
    this.statDataDf=  this.formatStatData(importedData)
 
  }else {
    alert(' Check Pipeline : Unlink Object ')
  }
  }

  showCount(){
  this.checkUnlinkedObject();
  this.runCodeService.executePipeGetCount(this.shipsInBoard).subscribe(
      resultat => {
        //////console.log(' runCodeService ',resultat)
      }
    );
  }
  checkUnlinkedObject(){
     return this.childEditor.CheckValidation();
  }
  checkUnlinkedObjectOld(){
  var ar:any[]=[]
  this.shipsInBoard=this.childEditor.transformEditorToShipBoard();
 
  for (var i = 0; i < this.shipsInBoard.length; i++) {
      if (this.shipsInBoard[i]['previous'].length == 0 && this.shipsInBoard[i]['next'].length == 0) {
        ar.push(this.shipsInBoard[i]['previous']);
      }
    }
    ////console.log(' unlinked length ',ar.length,   '  type ',this.shipsInBoard[0]['type'])
    if (ar.length > 1 || (ar.length==1 && this.shipsInBoard[0]['type']!="input" ))
    return true 
    else 
    return false
    
  }

////////////////////////////: last controle 23032022
arrayIsInclude(arr1:any,arr2:any){
  for (var i=0;i<arr1.length;i++)
    if (!arr2.includes(arr1[i])) return false
  return true
  }
  checkAllNoeaudControle(){
    var ar=[]
    var previous=[]
    //"controlePrevious":['yDf','MLPredict']
    for (var i = 0; i < this.shipsInBoard.length; i++) {
     // console.log(this.shipsInBoard[i]['idmodule'],' ---->>>>>>>>>>>>>>  ',this.shipsInBoard[i]['controlePrevious'])
      if ( this.shipsInBoard[i]['controlePrevious'] != undefined){
      previous=this.shipsInBoard[i]['previous'];
      previous=previous.map((el : any) => el=el.replace(/[0-9]/g, ''));
      console.log(previous,' ::::   ',this.arrayIsInclude(this.shipsInBoard[i]['controlePrevious'],previous))
      if (!this.arrayIsInclude(this.shipsInBoard[i]['controlePrevious'],previous)){
         ar.push(this.shipsInBoard[i]['idmodule']);
         
      }
      }
    }
      ////console.log(' unlinked length ',ar.length,   '  type ',this.shipsInBoard[0]['type'])
      //if (ar.length > 1 )
      //return true 
      //else 
      //return false
      return ar
  }

showSave(title:string) {
  let  projectConf:any={};

  const projectConfString = localStorage.getItem("projectConf");


  if (projectConfString !== null) {
    // Parse the string value to JSON
     projectConf = JSON.parse(projectConfString);

    // Now you can use the parsed JSON object
    console.log(projectConf);
} else {
    // Handle the case where the value is null
    console.error("No 'projectConf' found in localStorage.");
}
  
  console.log(' addddddddd showSave ddddddddddddd ',JSON.stringify(projectConf))

  const dialogConfig = new MatDialogConfig();
  dialogConfig.id = "modal-save"; //css style defined on style.scss
  dialogConfig.height = "450px"; //height
  dialogConfig.width = "800px"; //width
  dialogConfig.data = {"fileName":projectConf["fileName"],"title":title}; //width

  //https://material.angular.io/components/dialog/overview
  localStorage.setItem('data',JSON.stringify(this.shipsInBoard))

  const modalDialog = this.matDialog.open(SaveComponent, dialogConfig); //call the 
  
  modalDialog.afterClosed().subscribe(result => {
      if(result.fileName != ''){
         console.log(' addddddddd SaveComponent ddddddddddddd ',result.fileName)
         this.send.SendProject.next(result);
         //this.childC.updateProject() 
         this.projectConf['fileName']=result.fileName; 
      }
     });
}

showSaveNew(title:string) {
  
  const dialogConfig = new MatDialogConfig();
  dialogConfig.id = "modal-save"; //css style defined on style.scss
  dialogConfig.height = "450px"; //height
  dialogConfig.width = "800px"; //width
  dialogConfig.data = {"fileName":"","title":title}; //width

  //https://material.angular.io/components/dialog/overview
  localStorage.setItem('data',JSON.stringify(this.shipsInBoard))

  const modalDialog = this.matDialog.open(SaveComponent, dialogConfig); //call the 
  
  modalDialog.afterClosed().subscribe(result => {
      if(result.fileName != ''){
         console.log(' addddddddd SaveComponent ddddddddddddd ',result.fileName)
         //this.send.SendProject.next(result);
         //this.childC.updateProject()
         this.drawflow={ "drawflow": { "Home": { "data": {}}}}
         this.childEditor.updateEditor(this.drawflow);
         localStorage.setItem('userData',JSON.stringify(this.drawflow));
         /*let project=JSON.parse(localStorage.getItem("project")!)
         project.data=this.drawflow;
     
         localStorage.setItem('project',JSON.stringify(project))
         */
     
         
         this.projectConf['fileName']=result.fileName;
      }
     });
}


saveProjectServeur(){
const projectConfString = localStorage.getItem("projectConf");
if ( projectConfString !== null  ){
let project =JSON.parse(projectConfString)

if ( project["fileName"]==""){
  this.showSave(" Save Project As ")
  return 0
}
let dateCreation = moment().format('MMMM Do YYYY, h:mm:ss a'); // get the system date with moment library
   
console.log(' saveProjectServeur ',localStorage.getItem("projectConf"))
project.data=this.shipsInBoard
project.data=this.childEditor.transformEditorToShipBoard()
project.drawflow=this.childEditor.editor.drawflow
localStorage.setItem("userData",JSON.stringify(this.childEditor.editor.drawflow))
  
project.update=dateCreation
project.user=localStorage.getItem('user')
console.log(' saveProjectServeur ',JSON.stringify(project))
this.runCodeService.executeSavePipe(project).subscribe(
  resultat => {

    if (resultat[0]["data"]==1) {
      alert('  file     '+project.fileName+".json   "+"succefull saved")
      localStorage.setItem('data',JSON.stringify(this.shipsInBoard))
      localStorage.setItem('projectConf',JSON.stringify(this.projectConf))

      }else {
      alert('Error   file     '+project.fileName+".json   "+"not  saved")

      }
  });
  return 0;
}
return 0;
}
saveCronServeur(){
  let dateCreation = moment().format('MMMM Do YYYY, h:mm:ss a'); // get the system date with moment library
     
  console.log(' saveCronServeur ',localStorage.getItem("projectConf"))
  let project =JSON.parse(localStorage.getItem("projectConf")!)
  project.data=this.shipsInBoard
  project.update=dateCreation
  console.log(' saveCronServeur ',JSON.stringify(project))
  project['user']=localStorage.getItem('user')
 
  this.runCodeService.executeSaveCron(project).subscribe(
    resultat => {
  
      if (resultat[0]["data"]==1) {
        alert('  file     '+project.fileName+".json   "+"succefull saved")
        localStorage.setItem('data',JSON.stringify(this.shipsInBoard))
        localStorage.setItem('projectConf',JSON.stringify(this.projectConf))
  
        }else {
        alert('Error   file     '+project.fileName+".json   "+"not  saved")
  
        }
    });
  }
  



  saveProject(){
    let body = document.body;
          const a = document.createElement("a");
          let st=JSON.stringify(this.shipsInBoard, null, 2) 
          //this.dataSource.data.forEach((el : any) => st=st+el.code+'\n');
          a.href = URL.createObjectURL(new Blob([st], {
              type: "application/json"
          }));
          a.setAttribute("download", "data.json");
          body.appendChild(a);
          a.click();
          body.removeChild(a);
    
  }

  getIndexId(ar: any[], value: number) {
    for (var i = 0; i < ar.length; i++) {
      if (ar[i].id == value) {
        return i
      }
    }
    return -1;
  }
  
  getIndexIdModule(ar: any[], value: String) {
    //console.log(value,' getIndexIdMMMMMMMMMModule ',ar)
      for (var i = 0; i < ar.length; i++) {
        if (ar[i].idmodule == value) {
          return i
        }
      }
      return -1;
    }
    

  
  getPreviousById(ar:any,value:string){
    var i=this.getIndexIdModule(ar, value)
    if ( i >=0 ) return ar[i].previous
    else return []
    
    }
addElementToArray(tmpPrev:[],prev:any[]){
  for (var el in tmpPrev) {
    prev.push(tmpPrev[el])
  }
}
getAllPrevious(allObjs:any, valueArray:any, prev:any) {
  var tmpPrev = []
  for (var el in valueArray) {
    tmpPrev = this.getPreviousById(allObjs, valueArray[el])
    if (tmpPrev.length > 0) {
      for (var el in tmpPrev) {
        prev.push(tmpPrev[el])
      }
    }
    this.getAllPrevious(allObjs, tmpPrev, prev)

  }
}
    

  getIndex(ar: any[], value: string) {
    for (var i = 0; i < ar.length; i++) {
      if (ar[i].name == value) {
        return i
      }
    }
    return -1;
  }
  arraymove(arr:any, fromIndex:any, toIndex:any) {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
  }

  getTypeLastShip(){
    if (this.linkOne != '') {
      let event = this.shipsInBoard.find((el : any) => el.id == this.linkOne)
      ////console.log(' getTypeLastShip()  ', event['action'])

      return event['action']
    } else {
      const module = this.shipsInBoard.find((el : any) => el.next.length == 0)
      return module['action']
    }

  }

  isLastShipHasNext(){
    if ( this.linkOne!='' ){
    let event=this.shipsInBoard.find((el : any) => el.id==this.linkOne)
    //console.log(' isLastShipHasNext ',event)
    return event['next'].length==0
    }else 
    return false
 
   }
  
 buildPartialPipe(moduleArray:any){
   var idmodule = ''
   var partialShitOnBoard :any= []
   var index = -1
   var ob = {}
   const initObjectArray = cloneDeep(this.shipsInBoard);
   for (var i in initObjectArray) {
     idmodule = initObjectArray[i]['idmodule']
     index = moduleArray.findIndex((element:any) => element == idmodule);
     //initObjectArray[i]['columns'] = []
     if (index >= 0) {
       ob = initObjectArray[i];
       partialShitOnBoard.push(ob);
       if (index == 0) {
         partialShitOnBoard[partialShitOnBoard.length - 1]['next'] = [];
       }
     }
   }
   return partialShitOnBoard;
 }

 buildPartialPipeConf(moduleArray:any){
  var idmodule = ''
  var partialShitOnBoard :any= []
  var index = -1
  var ob = {}
  const initObjectArray = cloneDeep(this.shipsInBoard);
  //last change 27/12/2021 23:26 indexObjectSelected
  var indexObjectSelected = initObjectArray.findIndex((el : any) => el.id == this.linkOne)
  for (var i in initObjectArray) {
    idmodule = initObjectArray[i]['idmodule']
    index = moduleArray.findIndex((element:any) => element == idmodule);
    //last change 27/12/2021 add if before for all 
    if ( i == indexObjectSelected+'' )   initObjectArray[i]['columns'] = []
    if (index >= 0) {
      ob = initObjectArray[i];
      partialShitOnBoard.push(ob);
      if (index == 0) {
        partialShitOnBoard[partialShitOnBoard.length - 1]['next'] = [];
      }
    }
  }
  return partialShitOnBoard;
}

 // when click return all precedent object
 partialPipeObject(){
   var prev = []
   var index;
   ////console.log(' partialPipeObject ttttt')
   this.echangeDataConf={displayedColumns:[],data:[],actionColumns:[],selectedRows:[]}
   //////console.log(' this.selectedButton ',this.selectedButton)
   //////console.log(' conf element link obj ',this.linkOne)
   if (this.shipsInBoard.length > 1 && this.linkOne != '') {
     index = this.getIndexId(this.shipsInBoard, Number(this.linkOne))
     this.arraymove(this.shipsInBoard, index, 0)

     prev.push(this.shipsInBoard[index]['idmodule'])
     if (this.shipsInBoard[index]['previous'].length > 0) {
       //////console.log('  prev[0]    ',prev[0])//prev[0]['next']=[]
       //////console.log(' previouuuuuuuuuuuuuuuuus ',this.shipsInBoard[index]['previous'])
       this.addElementToArray(this.shipsInBoard[index]['previous'], prev)
       //prev.push(this.shipsInBoard[index]['previous'])
       this.getAllPrevious(this.shipsInBoard, this.shipsInBoard[index]['previous'], prev)
       //////console.log(' this.conf element prev ',prev)
       //////console.log(' shipInBoard ',this.shipsInBoard)
     }
     let  partialPipeObject = this.buildPartialPipe(prev);
     ////console.log(' partialPipeObject ttttttttttttttttttt ',partialPipeObject)
     return partialPipeObject;
   } else {
     return this.shipsInBoard
   }

}



// button select 
actionHandler1(data:any){
//  console.log('parent  validate data '+JSON.stringify(data))
let modelName =data.data[0]['model'];
alert(modelName+'  actionHandler 1'+JSON.stringify(data))
if ( data.action =='Download' ){
  this.runCodeService.downloadModel(data.data[0]['model']).subscribe(
    data=>{
      let downloadURL = window.URL.createObjectURL(data);
      // to be verified 
      //saveAs(downloadURL,modelName);
      this.downloadBase64Image(downloadURL,modelName);
    
    }
  );

  }
}

  openPlotModal(imageSource:any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.position= {top: '0%', left: '20%'}
    dialogConfig.id = "modal-component";
    dialogConfig.height = "800px";
    dialogConfig.width = "800px";
    dialogConfig.autoFocus= false;
    dialogConfig.height= '100%',

    dialogConfig.data = imageSource;
    //https://material.angular.io/components/dialog/overview
    const modalDialog = this.matDialog.open(PlotComponent, dialogConfig);
  }

  
  openFolderModal() {
    const dialogConfig = new MatDialogConfig();
    //The user can't close the dialog by clicking outside its body
    //dialogConfig.disableClose = true;
    dialogConfig.position= {top: '0%', left: '20%'}
    dialogConfig.id = "modal-component";
    dialogConfig.height = "800px";
    dialogConfig.width = "800px";
    dialogConfig.autoFocus= false;
    dialogConfig.height= '100%';
    dialogConfig.data= 'files';
    //dialogConfig.data = imageSource;
    //https://material.angular.io/components/dialog/overview
   // const modalDialog = this.matDialog.open(FolderTreeComponent, dialogConfig);
    const modalDialog = this.matDialog.open(FileTreeComponent, dialogConfig);
  }
  

//config button
validateConfigField(data:any){
   console.log('validateConfigField  form  ',JSON.stringify(data))
   let usrData  = JSON.parse(localStorage.getItem("userData")!);

   return 1

  if ( data.length==0 ){
      //this.clearSelect()
      return 1
  }

   var index = this.shipsInBoard.findIndex((el : any) => el.id == this.linkOne)
   this.selectedButton='conf'
 
   var prev=[]
   //collect data field from conf Form
   this.shipsInBoard[index]['form']=data;
    // add column if column_name is not undefine an d not ==''
   if ( this.shipsInBoard[index]['form']['column_name'] !=undefined 
   && this.shipsInBoard[index]['form']['column_name'].value !=''
   /*&& ( this.shipsInBoard[index]['action']=='ImpalaFormatDate' 
         || this.shipsInBoard[index]['action']=='ImpalaFunctCol' 
         || this.shipsInBoard[index]['action']=='ImpalaRank' )*/
   && !this.shipsInBoard[index]['columns'].includes(this.shipsInBoard[index]['form']['column_name'].value)){
  //console.log(this.shipsInBoard[index]['action'],'validateConfigField data columns  befffffffffffffffre '+JSON.stringify(this.shipsInBoard))
  const columnNameValue=this.shipsInBoard[index]['form']['column_name'].value
  const columnValue=this.shipsInBoard[index]['columns']

  this.shipsInBoard[index]['columns']=columnValue.concat([columnNameValue])
  this.shipsInBoard[index]['outPutColumns']=this.shipsInBoard[index]['columns'] ; 
  return 1;
  }

  if ( this.shipsInBoard[index]['action']=='ImpalaDb' ||
  this.shipsInBoard[index]['action']=='ImpalaSql' ||
  this.shipsInBoard[index]['action']=='inputImpalaSql') {
    //let fileContent =this.shipsInBoard[index]['form']['Nom_fichier']['content']
    let columns  =this.shipsInBoard[index]['form']['Query']['columns']
    //fileContent.map(el=>columns.push(el.name))
             
    this.echangeDataConf={displayedColumns:[],data:[],actionColumns:[],selectedRows:[]}
           
    this.shipsInBoard[index]['columns']=columns
    console.log('validateConfigField data columnssssssssssssssssss ',this.shipsInBoard[index]['columns'])
    this.shipsInBoard[index]['outPutColumns']=this.shipsInBoard[index]['columns'] ; 
    this.shipsInBoard[index]['initColumns'] =[]
    this.shipsInBoard[index]['columns'].forEach((a:string) => {let o:any={} ; o['column']=a; this.shipsInBoard[index]['initColumns'].push(o)})
    console.log('validateConfigField table-fil-sort-pag  data  initColumns  ', this.shipsInBoard[index]['initColumns'])
    //console.log('validateConfigField table-fil-sort-pag  data ',JSON.stringify(this.echangeDataConf.data))
    setTimeout(() => {
    //this.logInfoFlagGo=false
    this.echangeDataConf.selectedRows = this.shipsInBoard[index]['columns']
    this.echangeDataConf.data = this.shipsInBoard[index]['initColumns'] //this.getColumns(this.data)
    this.echangeDataConf.actionColumns = ['Select']
  }, 700);
  
    //this.childSelectCol.refresh()
    //this.childC.update()
    //this.linkOne=linkOneOld
    return 1;
  }
  

console.log('validateConfigField data ',this.shipsInBoard[index]['action'])
if ( this.shipsInBoard[index]['action'] =='aggGroupBy'  ){
  console.log('validateConfigField  action ',this.shipsInBoard[index]['action'])
  let cols =this.shipsInBoard[index]['form']['Function']
  let cols1 =this.shipsInBoard[index]['form']['Agg_Column']
  const col =(this.shipsInBoard[index]['form']['Function']['value']).concat(this.shipsInBoard[index]['form']['Agg_Column']['value'])
  this.shipsInBoard[index]['outPutColumns']=(this.shipsInBoard[index]['columns']).concat(col)
  
   return 1
}

if ( this.shipsInBoard[index]['action']=='folderInput' ||
    this.shipsInBoard[index]['action']=='inputCSV'  || 
    this.shipsInBoard[index]['action']=='inputJSON' ||
    this.shipsInBoard[index]['action']=='inputExcel' ) {
  console.log('this.shipsInBoard[index][form][Nom_fichier]  sssssssssssssssss ',this.shipsInBoard[index]['form']['Nom_fichier']['columns']);
  let columns :any[] =this.shipsInBoard[index]['form']['Nom_fichier']['columns']
  this.echangeDataConf={displayedColumns:[],data:[],actionColumns:[],selectedRows:[]}
         
  this.shipsInBoard[index]['columns']=columns;
  console.log('validateConfigField data columns folderInput sssssssssssssssss ',this.shipsInBoard[index]['columns'])
  this.shipsInBoard[index]['outPutColumns']=this.shipsInBoard[index]['columns'] ; 
  this.shipsInBoard[index]['initColumns'] =[];
  this.shipsInBoard[index]['columns'].forEach((a:any) => {let o:any={} ; o['column']=a; this.shipsInBoard[index]['initColumns'].push(o)})
  console.log('validateConfigField table-fil-sort-pag  data  initColumns  ', this.shipsInBoard[index]['initColumns'])
  //console.log('validateConfigField table-fil-sort-pag  data ',JSON.stringify(this.echangeDataConf.data))
  setTimeout(() => {
  //this.logInfoFlagGo=false
  this.echangeDataConf.selectedRows = this.shipsInBoard[index]['columns'];
  this.echangeDataConf.data = this.shipsInBoard[index]['initColumns']; //this.getColumns(this.data)
  this.echangeDataConf.actionColumns = ['Select'];
}, 700);

  return 1;
}

if ( this.shipsInBoard[index]['action'].toUpperCase().includes('PYTHON')) {
  let columns =this.shipsInBoard[index]['form']['Python_Code']['columns']
  this.echangeDataConf={displayedColumns:[],data:[],actionColumns:[],selectedRows:[]}
  
  let ar1=this.shipsInBoard[index]['columns']
  let ar2=columns
  let intersection = ar1.filter((x:string) => ar2.includes(x))
  let inter=ar2.filter((x:string) => !(ar1.includes(x.toUpperCase())||ar1.includes(x.toLowerCase())))
  this.shipsInBoard[index]['columns']=ar1.concat(inter)


  //this.shipsInBoard[index]['columns']=columns
   console.log('validateConfigField data columns folderInput sssssssssssssssss ',this.shipsInBoard[index]['columns'])
  this.shipsInBoard[index]['outPutColumns']=this.shipsInBoard[index]['columns'] ; 
  this.shipsInBoard[index]['initColumns'] =[]
  this.shipsInBoard[index]['columns'].forEach((a:string) => {let o:any={} ; o['column']=a; this.shipsInBoard[index]['initColumns'].push(o)})
  console.log('validateConfigField table-fil-sort-pag  data  initColumns  ', this.shipsInBoard[index]['initColumns'])
  //console.log('validateConfigField table-fil-sort-pag  data ',JSON.stringify(this.echangeDataConf.data))
  setTimeout(() => {
  //this.logInfoFlagGo=false
  this.echangeDataConf.selectedRows = this.shipsInBoard[index]['columns']
  this.echangeDataConf.data = this.shipsInBoard[index]['initColumns'] //this.getColumns(this.data)
  this.echangeDataConf.actionColumns = ['Select']
}, 700);


  //this.childSelectCol.refresh()
  //this.childC.update()
  //this.linkOne=linkOneOld
  return 1;
}
    //this.childSelectCol.validData()
    console.log('<<<<<<<<<<<<<<<<<<<<<   ',JSON.stringify(this.shipsInBoard))
     return 0;
  }

  ngOnDestroy() {
    // For method 1
    this.subscription && this.subscription.unsubscribe();

    // For method 2
    clearInterval(this.intervalId);
  }


  cronProject(){

    const uploadData = new FormData();
  
    //let form =  [{type:'uploadfile',label:'Nom fichier',value:""}]
    let form =  [
{type:'select',label:'Minute',value:'*',paramValue:['*','0','5','10','15','20','25','30','35','40','45','50','55']},
{type:'select',label:'Hour',value:'*',paramValue:['*','0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23']},
{type:'select',label:'day of month',value:'*',paramValue:['*','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31']},
{type:'select',label:'Month',value:'*',paramValue:['*','1','2','3','4','5','6','7','8','9','10','11','12']},
{type:'select',label:'day of week',value:'*',paramValue:['*','1','2','3','4','5','6','7']},
{type:'fileServer',label:'Destination',value:"",folder:"cron"}]
  
let data1 ={action:'action',id:5,type:"cron",currentModule:"upload",droppedModules:[],form:form}
    
this.send.SendMessage.next(data1); // call the subject behavior and send config object to config component
      
    
  }

  openProject(){

    var fileName='';
    console.log(' openProject  ');
    if ( this.linkOne != '' ) {
      var index = this.shipsInBoard.findIndex((el : any) => el.id == this.linkOne)
      console.log(' this.linkOne ',this.linkOne)
   
      if ( this.shipsInBoard[index]['action'] =='inputModule') {
        console.log(' openProject    ',this.shipsInBoard[index]['form']['Nom_fichier']['value'])
        fileName=this.shipsInBoard[index]['form']['Nom_fichier']['value'];

        this.runCodeService.getModuleContent(fileName).subscribe(
          content => {
            console.log(fileName,' Module  content ', content.content.data)
            this.shipsInBoard = content.content.data;
            this.langage=content.content.langage;
            console.log(' this.plateformForm ',this.plateformForm)
            this.plateformForm.controls['plateform'].setValue(this.langage)
            //this.buildNarrow(); 
            let projectConf = content.content;
            localStorage.setItem("data",JSON.stringify(this.shipsInBoard))
            localStorage.setItem("project",JSON.stringify(content.content))
            delete projectConf.data;
            localStorage.setItem("projectConf", JSON.stringify(projectConf));
            console.log(' addddddddd ProjectContent ddddddddddddd ', localStorage.getItem("projectConf"))
          
            this.send.SendProject.next(projectConf);
            //this.childC.updateProject()
          }
        );
        
      } 
  }
  if ( fileName.length > 0  )  return 0 ;
    const dialogConfig = new MatDialogConfig();
    //The user can't close the dialog by clicking outside its body
    //dialogConfig.disableClose = true;
    dialogConfig.position= {top: '0%', left: '20%'}
    dialogConfig.id = "modal-component";
    dialogConfig.height = "800px";
    dialogConfig.width = "800px";
    dialogConfig.autoFocus = false;
    dialogConfig.height= '100%';
    dialogConfig.data= {user:localStorage.getItem('user'),folder:'projects'};
    //dialogConfig.data = imageSource;
    //https://material.angular.io/components/dialog/overview
    //const modalDialog = this.matDialog.open(FolderTreeComponent, dialogConfig);
    const modalDialog = this.matDialog.open(FileTreeComponent, dialogConfig);
    
  modalDialog.afterClosed().subscribe(result => {
   if(result != undefined && result.data.length>1 ){
        console.log(' adddddddddd  after Close dddddddddddd ',result.data)
        //this.myFormGroup.controls["Nom fichier"].setValue(result.data)
        fileName=localStorage.getItem('user') +':'+result.data
 
     this.runCodeService.getProjectContent(fileName).subscribe(
       content => {
        console.log(' after content  ',JSON.stringify(content))
        this.drawflow=content.content.drawflow;
        if ( this.drawflow == undefined) this.drawflow={ "drawflow": { "Home": { "data": {}}}}
        this.childEditor.updateEditor(this.drawflow);
        localStorage.setItem('userData',JSON.stringify(this.drawflow));
       /* let project=JSON.parse(localStorage.getItem("project")!)
         project.data=this.drawflow;
     
         localStorage.setItem('project',JSON.stringify(project))
        */
               
        if (Object.keys(content.content).length>0){
         console.log(fileName,' After close  project content ', content.content.data)
         this.shipsInBoard = content.content.data;
         //this.buildNarrow();
         this.projectConf = content.content;
         this.langage=content.content.langage;
         console.log(' this.plateformForm buggggggggggg  ',this.projectConf)
         this.plateformForm.controls['plateform'].setValue(this.langage)
         localStorage.setItem("data",JSON.stringify(this.shipsInBoard))
         localStorage.setItem("project",JSON.stringify(content.content))
         delete this.projectConf.data;
         localStorage.setItem("projectConf", JSON.stringify(this.projectConf));
         console.log(' updateModulePanel  addddddddd ProjectContent ddddddddddddd ', localStorage.getItem("projectConf"))
         //this.updateModulePanel();
         this.send.SendProject.next(this.projectConf);
        // this.childC.updateProject()
        }else alert(' Error wile openning project ')
       }
     );

    }
    //this.csv=result.data;
   });
 
    return 0;
  }

  logout(){
    localStorage.removeItem('token');
    this.router.navigate(['/']);

  }

   formatStatData(obj: any[]): any[] {
    let allObj: any[] = [];
    console.log("lables ",JSON.stringify(obj) )
    obj.forEach(function (app) {
      let label = Object.keys(app)[0];
      let labels = Object.keys(app[label]);
      let data = Object.values(app[label]);
      let oneParcielObj: any = {};
      let oneObj: any = { 'title': label, 'type': '' };
      console.log("lables ",label," labels ",labels, "data" ,data )
      if (labels.length > 1 && labels.length < 4) oneObj['type'] = 'pie';
      if (labels.length > 4) oneObj['type'] = 'bar';
  
      oneObj['labels'] = labels;
      oneParcielObj['data'] = data;
      oneParcielObj['label'] = label;
  
      oneObj['data'] = [oneParcielObj];
      allObj.push(oneObj);
      console.log(" all object ",JSON.stringify(allObj))
    })
  
    return allObj;
  }


  selectedButtonToRun(){
    if ( this.echangeData.data.length >0 )
    this.selectedButton='run'
   }
 
getStatDf(){
var statData:any[]=[]
var importedData:any[]=[] ;
const pipeProject = { logFile:this.logFileName,user:localStorage.getItem('user'),langage:this.plateformForm.controls['plateform'].value, pipeObject:this.shipsInBoard}
 
this.runCodeService.executePipeGetColStat(pipeProject).subscribe(
   resultat => {
    importedData=resultat;
    console.log(' executePipeGetColStat ',JSON.stringify(resultat));
    
    
  },error => {
    console.log(' executePipeGetColStat Error ',);
    return []
  });

return  this.formatStatData(importedData)

}


navActionHandler(event:any){
  //this.sidenav.close()

console.log(' navActionHandler ',event.data)

if (event.data=="New") {
  if ( this.activeSaveFlag() ) { 
    alert(' save before or cancel change by reload')
    return 0
  }
  //this.openProject() 
  this.shipsInBoard=[];
  /*this.clearSelect();
  this.buildNarrow();  */
  localStorage.setItem("data",JSON.stringify(this.shipsInBoard))
 
  let dateCreation = moment().format('MMMM Do YYYY, h:mm:ss a'); // get the system date with moment library
 
  this.projectConf = { fileName: "", version: "01", update:dateCreation,creationDate: dateCreation, auteur: this.user}
  console.log(' New ',this.projectConf)
  this.langage=this.plateformForm.controls['plateform'].value!;
  localStorage.setItem("projectConf",JSON.stringify(this.projectConf)) 
  let project = JSON.parse(localStorage.getItem('projectConf')!);
     project["fileName"]=''
     project["auteur"]=localStorage.getItem('user')
     project["user"]=localStorage.getItem('user')
     project.data=[]
     project.update=dateCreation
     //project["update"]=dateCreation
     delete project["logFile"]
     this.send.SendProject.next(project);
    
     

  this.showSaveNew("Enter Project Name "); 

}

if (event.data=="Open") {
  if ( this.activeSaveFlag() ) { 
    alert(' save before or cancel change by reload')
    return 0
  }
  this.openProject()}
if (event.data=="cron") {

  this.router.navigate(['/schedule']);
  //this.cronProject()

}
if (event.data=="Save") {
  
  this.showSave("Save Project As ")
}
if (event.data=="Delete"  ) {
  if (window.confirm(' Delete the projet  : Are you sure ?')){
    this.shipsInBoard=[]
    localStorage.setItem('data',JSON.stringify(this.shipsInBoard))
    localStorage.setItem('projectConf','')
    this.projectConf={}
    this.paletteBar = false
    this.linkOne = ''
    //this.buildNarrow()
    this.send.SendProject.next({});
    //this.childC.updateProject()
  }
  

}
if ( event.data=="Close" ) {
  if ( this.activeSaveFlag() )
  if (window.confirm('Sauvegarder les modifications  apportées au projet  ?')){
    this.saveProjectServeur()
  }
    this.shipsInBoard=[]
    this.projectConf={}
    localStorage.setItem('data',JSON.stringify(this.shipsInBoard))
    localStorage.setItem('projectConf','')
    localStorage.setItem('project','')
    this.paletteBar = false
    this.linkOne = ''
    //this.buildNarrow()
    //this.send.SendProject.next({});
    this.send.SendMessage.next({});
    //this.childC.updateProject() 
    this.plateformForm.controls['plateform'].setValue('Python')
    //this.updateModulePanel()
  
}

if ( event.data=="Upload" ) {
this.uploadFile();

}

if ( event.data=="Download" ) {
  this.openDownLoadFile();
  }
  
  if ( event.data=="DeleteFile" ) {
    this.deleteRemoteFile();
    }
return 0;
}

activeSaveFlag(){
  if ( localStorage.getItem("data") != null){
   var cloneObject=cloneDeep(this.shipsInBoard)
   var cloneStoregeObject=JSON.parse(localStorage.getItem("data")!)
   for(var i=0;i<cloneObject.length;i++){
    delete cloneObject[i].color;
  }
  for(var i=0;i<cloneStoregeObject.length;i++){
    delete cloneStoregeObject[i].color;
  }
 // console.log(cloneObject.length,'cloneObject ',JSON.stringify(cloneObject)!=JSON.stringify(cloneStoregeObject))
  //console.log('cloneStoregeObject ',JSON.stringify(cloneStoregeObject))
      return cloneObject.length > 0 && JSON.stringify(cloneObject) != JSON.stringify(cloneStoregeObject)
  }else return false
  
  }

uploadFile(){
//this.clearSelect()
  const uploadData = new FormData();

  //let form =  [{type:'uploadfile',label:'Nom fichier',value:""}]
  let form =  [{type:'fileServer',label:'Destination',value:"",folder:""},{type:'uploadfile',label:'Nom fichier',value:""}]


  let data1 ={action:'action',id:5,type:"uploadfile",currentModule:"upload",droppedModules:[],form:form}
  
  
  this.send.SendMessage.next(data1); // call the subject behavior and send config object to config component
    
  
}

deleteRemoteFile(){
  const dialogConfig = new MatDialogConfig();
  //The user can't close the dialog by clicking outside its body
  //dialogConfig.disableClose = true;
  dialogConfig.position= {top: '0%', left: '20%'}
  dialogConfig.id = "modal-component";
  dialogConfig.height = "800px";
  dialogConfig.width = "800px";
  dialogConfig.autoFocus= false;
  dialogConfig.height= '100%';
  dialogConfig.data= {user:localStorage.getItem('user'),folder:''};
  //dialogConfig.data = imageSource;
  //https://material.angular.io/components/dialog/overview
  //const modalDialog = this.matDialog.open(FolderTreeComponent, dialogConfig);
  const modalDialog = this.matDialog.open(FileTreeComponent, dialogConfig);
  
  modalDialog.afterClosed().subscribe(result => {
 if(result != undefined && result.data.length>1 ){
  console.log(' adddddddddddd /////////////////  ddddddd ',result)
  let filePath=result.data;
  const deleteData = new FormData();
  var projectName = "";

  //let projet =  localStorage.getItem('project')["fileName"];
  deleteData.append('filename', filePath);

  deleteData.append('user',localStorage.getItem('user')!);
  const projectString = localStorage.getItem('project');
  if ( projectString !== null ){
    let projectName = JSON.parse(projectString)["fileName"];
 
  //console.log(' deletData  ',localStorage.getItem('project')["fileName"])
  if (projectName !="" && filePath.includes(projectName)){
      alert(' you can t delete currente project')
  }else
  if (window.confirm(' Delete the File   : '+filePath+'\n Are you sure ?')){
      this.runCodeService.deleteFile(deleteData).subscribe(
         content => {
          console.log(' downnloadModel //// ')
          swal.fire('file succeful delete ')
          swal.getConfirmButton()
       }
      
      );
    }
   }
  }
   //this.csv=result.data;
  });

}

openDownLoadFile() {
  const dialogConfig = new MatDialogConfig();
  dialogConfig.position = { top: '0%', left: '20%' };
  dialogConfig.id = "modal-component";
  dialogConfig.height = "800px";
  dialogConfig.width = "800px";
  dialogConfig.autoFocus = false;
  dialogConfig.height = '100%';
  dialogConfig.data = { user: localStorage.getItem('user'), folder: '' };

  const modalDialog = this.matDialog.open(FileTreeComponent, dialogConfig);

  modalDialog.afterClosed().subscribe(result => {
    if (result !== undefined && result.data.length > 1) {
      let filePath = result.data;
      this.runCodeService.getFileContent(filePath).subscribe(
        content => {
          const blob = new Blob([content], { type: 'application/octet-stream' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', filePath.split(':').pop()); // Set the filename
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        },
        error => {
          console.error('Error downloading file:', error);
        }
      );
    }
  });
}

// Create a function to trigger the file download
downloadBase64Image(base64String: string, filename: string) {
  // Create a blob from the base64 encoded string
  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'image/jpeg' }); // Adjust the type accordingly

  // Create an anchor element and set its attributes
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;

  // Programmatically trigger the download
  a.click();

  // Clean up
  URL.revokeObjectURL(a.href);
}

//////////////////////  code for new flow  //////////


}
