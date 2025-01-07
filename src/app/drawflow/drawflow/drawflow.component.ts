import { clone, cloneDeep } from 'lodash';
//import { NavbarComponent } from './../../navbar/navbar.component';
import { MatConfComponent } from './../../components/mat-conf/mat-conf.component';
import { Component,ViewChild, Input,Output, OnInit ,EventEmitter} from '@angular/core';
import Drawflow from 'drawflow';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { FactorialComponent } from 'src/app/factoriel/factoriel.component';
import {  NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorService } from 'src/app/shared/behavior.service';

@Component({
  selector: 'app-drawflow',
  templateUrl: './drawflow.component.html',
  styleUrls: ['./drawflow.component.css']
})
export class DrawflowComponent implements OnInit {
  @ViewChild(FactorialComponent, { static: false }) childC!: FactorialComponent;
  
  @Output() confElementChanged: EventEmitter<any> =   new EventEmitter();
  @Input() InputDrawflow : any ={} 
  public traitModule :any[]= [
    { id :1  ,name:"pythonCode",icon: 'fas fa-network-wired',  action:"pythonCode",type:"treat","origin":"local",previous:[],columns:[],initColumns:[],form:{Python_Code:{type:'textarea',label:'Python Code',value:'#use previous df as  df_previousModule and current as df_currentModule \ndf_currentModule=df_previousModule \n #for series use df_currentModule=series.to_frame(name=vals).reset_index() \n#for value to dataFrame  d={val:[val]}  df_currentModule=pd.DataFrame.from_dict(d)',paramValue:'',help:""}}, size: 1, next: [], outPutColumns:[],img:"assets/python.png", color: "white","description":"Python Code"},
    { id :2  ,name:"aggGroupBy", icon: 'fas fa-network-wired', action:"aggGroupBy", type:"treat",  paramValue:[["Agg_Column","Columns"],["Columns"]]  ,previous:[], size: 1, next: [],outColumns:[], outPutColumns:[],img:"assets/agg.png", color: "white" ,columns:[],initColumns:[],aggColumns:[],form:{Columns:{type:'selectMultiple',label:'Columns',value:'',paramValue:[],help:""},Function:{type:'select',label:'Function',value:'',paramValue:['count','sum','max','min','moyenne1'],help:""},Agg_Column:{type:'select',label:'Agg Column',value:'',paramValue:[''],help:""}},groupByField:["id"],verbeField:["'montant': 'sum'"],top:50, left:100},
    { id :3  ,name:"ImpalaAgg", icon: 'fas fa-network-wired', action:"ImpalaAgg", type:"treat", paramValue:[["Agg_Column"]],previous:[], size: 1, next: [], outPutColumns:[],img:"assets/ImpalaAgg.png", color: "white" ,columns:[],initColumns:[],aggColumns:[],form:{Function:{type:'select',label:'Function',value:'',paramValue:['count','sum','max','min','moyenne2','ecartype'],help:""},Agg_Column:{type:'select',label:'Agg Column',value:'',paramValue:[''],help:""},Impala_Code:{type:'textarea',label:'Impala Code',value:'',paramValue:'',help:""}},groupByField:["id"],verbeField:["'montant': 'sum'"],top:50, left:100},
    { id :4  ,name:"ImpalaLimit", icon: 'fas fa-network-wired', action:"ImpalaLimit",type:"treat","origin":"local",previous:[],next: [],columns:[],initColumns:[],form:{Row_Number:{type:'text',label:'Row Number',value:'',paramValue:[],help:""}}, size: 1, outPutColumns:[],img:"assets/ImpalaLimit.png", color: "white","description":"Python Code"},
    { id :5  ,name:"filter",icon: 'fas fa-network-wired', action:"filter", type:"treat", previous:[],paramValue:[["Filter_Column"]], size: 1, next: [], outPutColumns:[],form:{Filter_Column:{type:'select',label:'Filter Column',value:'',paramValue:[],help:""},Filter_Condition:{type:'select',label:'Filter Condition',value:'',paramValue:['==','!=','>','>=','<=','<'],help:""},Filter_Value:{type:'text',label:'Filter Value',value:'',paramValue:[],help:""}},columns:[],initColumns:[], img:"assets/dfilter.png", color: "white" ,column:"id",condition:">=2",top:50, left:100},
    { id :6  ,name:"Impala",icon: 'fas fa-network-wired', action:"Impala", type:"treat", previous:[],paramValue:[["Filter_Column"]], size: 1, next: [], outPutColumns:[],form:{Filter_Column:{type:'select',label:'Filter Column',value:'',paramValue:[],help:""},Filter_Condition:{type:'select',label:'Filter Condition',value:'',paramValue:['=','!=','>','>=','<=','<','like'],help:""},Filter_Value:{type:'text',label:'Filter Value',value:'',paramValue:[],help:""},Impala_Code:{type:'textarea',label:'Impala Code',value:'',paramValue:'',help:""}},columns:[],initColumns:[], img:"assets/impalaFilter.png", color: "white" ,column:"id",condition:">=2",top:50, left:100},
    { id :7  ,name:"concat", type:"treat", icon: 'fas fa-network-wired', action:"concat", paramValue:[[]],previous:[], size: 1, next: [],img:"assets/concat.png",columns:[], initColumns:[],outPutColumns:[],form:{}, color: "white" ,column:"id",condition:">=2",top:50, left:100},
    { id :8  ,name:"setIndex", type:"treat", icon: 'fas fa-network-wired', action:"setIndex", paramValue:[["Column"]],previous:[], size: 1, next: [],img:"assets/concat.png",columns:[], initColumns:[],outPutColumns:[],form:{Column:{type:'select',label:'Column',value:'',paramValue:[],help:""},Python_Code:{type:'textarea',label:'Python Code',value:'#use previous df as  df_previousModule and current as df_currentModule \ndf_currentModule=df_previousModule \ndf_currentModule=df_previousModule \ndf_currentModule.set_index("$Value")',help:""}}, color: "white" ,column:"id",condition:">=2",top:50, left:100}, 
    { id :9  ,name:"sort", type:"treat", icon: 'fas fa-network-wired', action:"pythonCode", paramValue:[["Column"]],previous:[], size: 1, next: [],img:"assets/concat.png",columns:[], initColumns:[],outPutColumns:[],form:{Column:{type:'select',label:'Column',value:'',paramValue:[],help:""},Python_Code:{type:'textarea',label:'Python Code',value:'#use previous df as  df_previousModule and current as df_currentModule \ndf_currentModule=df_previousModule  \ndf_currentModule.sort_values(by="$Value", inplace=True)',help:""}}, color: "white" ,column:"id",condition:">=2",top:50, left:100}, 
    { id :10  ,name:"fillna",  type:"treat", icon: 'fas fa-network-wired', action: "fillna",paramValue:[["fillNa_Column"]] , previous:[], size: 1, next: [],img:"assets/fillNa1.png",columns:[],initColumns:[], outPutColumns:[],form:{fillNa_Column:{type:'selectMultiple',label:'fillNa Column',value:'',paramValue:[],help:""},fillNa_Value:{type:'select',label:'fillNa Value',value:'',paramValue:['min','max','mean','0','1','-1'],help:""}}, color: "white" ,df_field:"Group",value_na:"'Gp'",top:50, left:200 },
    { id :11  ,name:"dropNa",  type:"treat", icon: 'fas fa-network-wired', action: "Code_dropNa",paramValue:[[]] , previous:[], size: 1, next: [],img:"assets/dropNull.png",columns:[],initColumns:[], outPutColumns:[],text_code:"df_currentModule=df_previousModule.dropna()", color: "white" ,df_field:"Group",value_na:"'Gp'",top:50, left:200 },
    { id :12  ,name:"replace", type:"treat", icon: 'fas fa-network-wired', action: "replace", paramValue:[["Column"]] , previous:[], size: 1, next: [],img:"assets/replace.png",columns:[],initColumns:[], outPutColumns:[],form:{Column:{type:'selectMultiple',label:'Column',value:'',paramValue:[],help:""},Init_String:{type:'text',label:'Init String',value:'',help:""},Replaced_String:{type:'text',label:'Replaced String',value:'',help:""}}, color: "white" ,df_field:"Group",value_na:"'Gp'",top:50, left:200 }, 
    { id :13  ,name:"asType", type:"treat", icon: 'fas fa-network-wired', action: "asType", paramValue:[["Column"]] , previous:[], size: 1, next: [],img:"assets/AsType.png",columns:[],initColumns:[], outPutColumns:[],form:{Column:{type:'selectMultiple',label:'Column',value:'',paramValue:[],help:""},convert_to:{type:'select',label:'convert to',value:'',paramValue:['str','int','float'],help:""}}, color: "white" ,df_field:"Group",value_na:"'Gp'",top:50, left:200 },  
    { id :14  ,name: "merge", type:"treat",icon: 'fas fa-network-wired', action: "merge",paramValue:[["Merge_left"],["Merge_right"]], previous:[],size: 1, next: [],columns:[],initColumns:[], outPutColumns:[],form:{Merge_how:{type:'select',label:'Merge how',value:'',paramValue:['left','inner','outer'],help:""},Merge_left:{type:'select',label:'Merge left',value:'',paramValue:[]},Merge_right:{type:'select',label:'Merge right',value:'',paramValue:[]}},img:"assets/merge.png", color: "white" ,top:50, left:100,merge_how:"left"},
    { id :15  ,name: "ImpalaMerge", type:"treat",icon: 'fas fa-network-wired', action: "ImpalaMerge", previous:[],size: 1, next: [],columns:[],initColumns:[], outPutColumns:[],form:{Merge_how:{type:'select',label:'Merge how',value:'',paramValue:['left','inner','outer'],help:""},Merge_left:{type:'select',label:'Merge left',value:'',paramValue:[]},Merge_right:{type:'select',label:'Merge right',value:'',paramValue:[]},Impala_Code:{type:'textarea',label:'Impala Code',value:'',paramValue:'',help:""}},img:"assets/ImpalaMerge.png", color: "white" ,top:50, left:100,merge_how:"left"},
    { id :16  ,name: "ImpalaOrderBy", type:"treat",icon: 'fas fa-network-wired', action: "ImpalaOrderBy", paramValue:[["order_by"]],previous:[],size: 1, next: [],columns:[],initColumns:[], outPutColumns:[],form:{order_how:{type:'select',label:'order how',value:'DESC',paramValue:['ASC','DESC'],help:""},order_by:{type:'select',label:'order by',value:'',paramValue:[]}},img:"assets/orderBy.png", color: "white" ,top:50, left:100},
    { id :17  ,name: "ImpalaRank" , type:"treat",icon: 'fas fa-network-wired', action: "ImpalaRank", paramValue:[["partition_by","order_by"]] , previous:[],size: 1, next: [],columns:[],initColumns:[], outPutColumns:[],form:{partition_by:{type:'selectMultiple',label:'partition by',value:'',paramValue:['ali','salam','mounir'],help:""},order_how:{type:'select',label:'order how',value:'DESC',paramValue:['ASC','DESC'],help:""},order_by:{type:'select',label:'order by',value:'',paramValue:[]},column_name:{type:'text',label:'column name',value:'rank',paramValue:[]}},img:"assets/ImpalaRank.png", color: "white" ,top:50, left:100},
    { id :18  ,name: "ImpalaLag" , type:"treat",icon: 'fas fa-network-wired', action: "ImpalaLag", paramValue:[["Filed_Column","partition_by","order_by"]] , previous:[],size: 1, next: [],columns:[],initColumns:[], outPutColumns:[],form:{Filed_Column:{type:'selectMultiple',label:'Filed Column',value:'',paramValue:[],help:""},partition_by:{type:'selectMultiple',label:'partition by',value:'',paramValue:['ali','salam','mounir'],help:""},order_how:{type:'select',label:'order how',value:'DESC',paramValue:['ASC','DESC'],help:""},order_by:{type:'select',label:'order by',value:'',paramValue:[]},col_name:{type:'text',label:'col name',value:'rank',paramValue:[]}},img:"assets/ImpalaRank.png", color: "white" ,top:50, left:100},  
    { id :19  ,name: "ImpalaFormatDate",  type:"treat",icon: 'fas fa-network-wired', action: "ImpalaFormatDate", paramValue:[['column_date']],previous:[],size: 1, next: [],columns:[],initColumns:[], outPutColumns:[],form:{Date_Func:{type:'select',label:'Date Func',value:'day',paramValue:['day','month','year'],help:""},column_date:{type:'select',label:'column date',value:'',paramValue:[]},column_name:{type:'text',label:'column name',value:'',paramValue:[]}},img:"assets/ImpalaFormatDate.png", color: "white" ,top:50, left:100},
    { id :20  ,name: "ImpalaFunctCol" , type:"treat",icon: 'fas fa-network-wired', action: "ImpalaFunctCol",  paramValue:[['column_func']],previous:[],size: 1, next: [],columns:[],initColumns:[], outPutColumns:[],form:{Function_Column:{type:'textarea',label:'Function Column',value:'',paramValue:[],help:""},column_func:{type:'select',label:'column func',value:'',paramValue:[]},column_name:{type:'text',label:'column name',value:'',paramValue:[]}},img:"assets/ImpalaFunctCol.png", color: "white" ,top:50, left:100},
    { id :21  ,name: "normalize", type:"treat", icon: 'fas fa-network-wired', action: "normalize", previous:[],size: 1, next: [],img:"assets/Normalize.png",columns:[],initColumns:[], outPutColumns:[], color: "white" ,top:50, ignore_index:"True", merge_on:"id"},
    { id :22  ,name:"sCol", type:"treat", icon: 'fas fa-network-wired', action:"sCol",paramValue:[['Columns']],previous:[],size:1,next:[],form:{Columns:{type:'selectMultiple',label:'Columns',value:'',paramValue:[],help:""}},img:"assets/cfilter.png",columns:[],initColumns:[],outPutColumns:[]},
    { id :23  ,name:"sql", icon: 'fas fa-network-wired', action:"sql",type:"treat","origin":"local",previous:[],columns:[],initColumns:[],form:{SQL_Code:{type:'textarea',label:'SQL Code',value:'--use df_previousModule to select previous dataframe \n '}}, size: 1, next: [], outPutColumns:[],img:"assets/sql.png", color: "white","description":"Python Code"}, 
 	{ id :24  ,name:"desc",  type:"debug",icon: 'fas fa-network-wired', action:"desc","origin":"local",previous:[],form:{}, size: 1, next: [],columns:[],initColumns:[], outPutColumns:[],img:"assets/imgShape.png", color: "white","description":"read from csv 1"},
    { id :25  ,name:"shape", icon: 'fas fa-network-wired', action:"shape",type:"debug","origin":"local",previous:[],form:{},columns:[],initColumns:[],valueCode:'df_currentModule=df_previousModule \nval=df_currentModule.shape \ndf_currentModule=pd.DataFrame.from_dict({\'val\':list(val)}) \ndf_currentModule=df_currentModule', size: 1, next: [], outPutColumns:[],img:"assets/imgShape1.png", color: "white","description":"Python Code"},
    { id :26  ,name:"corr", icon: 'fas fa-network-wired', action:"corr",type:"debug","origin":"local",previous:[],form:{},columns:[],initColumns:[],valueCode:'df_currentModule=df_previousModule \ndf_currentModule=df_currentModule.corr()', size: 1, next: [], outPutColumns:[],img:"assets/corr.png", color: "white","description":"Python Code"}
  ,
    {"id":27 ,"name":"folderInput","type":"input","icon": 'fas fa-network-wired', "action":"folderInput","origin":"local",previous:[],form:{Nom_fichier:{type:'multiFileServer',label:'Nom fichier',value:"",folder:"input",help:"SSSS  selection un fichier de format CSV <br> la premier ligne doit contenir les noms des colonnes"},Separateur:{type:'text',label:'Separateur',value:",",help:{text_top:"Separateur111 \n",text_buttom:" \nhelp",image:"assets/logoAnalytics.png"}},icon: 'fas fa-network-wired', action:{type:'select',label:'Action',value:'Concat',paramValue:['Concat','Merge'],help:""}}, size: 1, next: [], outPutColumns:[],columns:[],initColumns:[], img:"assets/folder.png",color: "white","description":"inout csv"},
    {"id":28,"name":"inputCSV","type":"input","icon": 'fas fa-network-wired', "action":"inputCSV","origin":"local",previous:[],form:{Nom_fichier:{type:'fileServer',label:'Nom fichier',value:"",folder:"input",content:[],help:{text_top:"selection un fichier de format CSV \n la premier ligne doit contenir les noms des colonnes"}},Separateur:{type:'text',label:'Separateur',value:",",help:{text_top:"Separateur111 \n",text_buttom:" \nhelp",image:"assets/logoAnalytics.png"}},Delete_After:{type:'checkbox1',label:'Delete After',value:0}}, size: 1, next: [], outPutColumns:[],columns:[],initColumns:[], img:"assets/csv.png",color: "white","description":"inout csv"},
    {"id":29,"name":"kafkaConsumer","type":"input","icon": 'fas fa-network-wired', "action":"kafkaConsumer","origin":"local",previous:[],form:{hosts :{type:'text',label:'hosts',value:"",folder:"input",content:[],help:{text_top:"selection un fichier de format CSV \n la premier ligne doit contenir les noms des colonnes"}},topic:{type:'text',label:'topic',value:"",help:{text_top:"Separateur111 \n",text_buttom:" \nhelp",image:"assets/logoAnalytics.png"}},Delete_After:{type:'checkbox1',label:'Delete After',value:0}}, size: 1, next: [], outPutColumns:['id','date','montant','offre','localisation','groupe'],columns:['id','date','montant','offre','localisation','groupe'],initColumns:['id','date','montant','offre','localisation','groupe'], img:"assets/KConsumer.png",color: "white","description":"inout csv"},
    {"id":30,"name":"inputApiGet","type":"input","icon": 'fas fa-network-wired', "action":"inputApiGet","origin":"local",previous:[],form:{Url:{type:'text',label:'Url',value:"http://127.0.0.1:5000/api/purchases",content:[],help:"saisir l'url de l'Api type get"}}, size: 1, next: [], outPutColumns:["clientid"	,"date_heure",	"prix"	,"prix_total"	,"produit"	,"quantite"],columns:["clientid"	,"date_heure",	"prix"	,"prix_total"	,"produit"	,"quantite"],initColumns:["Clientid"	,"Date_heure",	"Prix"	,"Prix_total"	,"Produit"	,"Quantite"], img:"assets/ApiGet.png",color: "white","description":"read from Api get"},
    {"id":31,"name":"inputDBOracle","type":"input","icon": 'fas fa-network-wired', "action":"inputDbOracle","origin":"local",previous:[],form:{DNS:{type:'text',label:'DNS',value:"http://127.0.0.1:5000/BSCS",content:[],help:"saisir l'url de l'Api type get"},SQL_Code:{type:'textarea',label:'SQL Code',value:'select tmcode, des from param.rateplan where tmcode=55 '}}, size: 1, next: [], outPutColumns:["tmcode","des"],columns:["tmcode","des"],initColumns:["tmcode","des"], img:"assets/impalaSql.png",color: "white","description":"read from Api get"},
    {"id":32,"name":"outputDBOracle","type":"output","icon": 'fas fa-network-wired', "action":"inputDbOracle","origin":"local",previous:[],form:{DNS:{type:'text',label:'DNS',value:"http://127.0.0.1:5000/BSCS",content:[],help:"saisir l'url de l'Api type get"},SQL_Code:{type:'textarea',label:'SQL Code',value:'select tmcode, des from param.rateplan where tmcode=55 '}}, size: 1, next: [], outPutColumns:["tmcode","des"],columns:["tmcode","des"],initColumns:["tmcode","des"], img:"assets/impalaSql.png",color: "white","description":"read from Api get"},
    {"id":33,"name":"inputImpalaSql","type":"input","icon": 'fas fa-network-wired', "action":"inputImpalaSql","origin":"local",previous:[],form:{Nom_fichier:{type:'fileServer',label:'Nom fichier',value:"",folder:"input",content:[],help:"selection un fichier de format CSV <br> la premier ligne doit contenir les noms des colonnes"},Query:{type:'textarea',label:'Query',value:"", disable:1}}, size: 1, next: [], outPutColumns:[],columns:[],initColumns:[], img:"assets/sql.png",color: "white","description":"inout csv"},
    {"id":34,"name":"inputExcel","type":"input","icon": 'fas fa-network-wired', "action":"inputExcel","origin":"local",previous:[],form:{Nom_fichier:{type:'fileServer',label:'Nom fichier',value:"",folder:"input",content:[],help:"selection un fichier de format CSV <br> la premier ligne doit contenir les noms des colonnes"}}, size: 1, next: [], outPutColumns:[],columns:[],initColumns:[], img:"assets/excel.png",color: "white","description":"inout csv"},
    {"id":35,"name":"inputJSON","type":"input","icon": 'fas fa-network-wired', "action":"inputJSON","origin":"local",previous:[],form:{Nom_fichier:{type:'fileServer',label:'Nom fichier',value:"",folder:"input",help:"selection un fichier de format CSV <br> la premier ligne doit contenir les noms des colonnes"},Separateur:{type:'text',label:'Separateur',value:","}}, size: 1, next: [], outPutColumns:[],columns:[],initColumns:[], img:"assets/json.png",color: "white","description":"inout csv"}, 
    {"id":36,"name":"pythonInput","type":"input","icon": 'fas fa-network-wired', "action":"pythonInput","origin":"local",previous:[],form:{Python_Code:{type:'textarea',label:'Python Code',value:'#use  df as  df_$currentModule \n',paramValue:'',help:"Example \nimport seaborn as sns\n  df_$currentModule = sns.load_dataset(\'iris\')"}}, size: 1, next: [], outPutColumns:[],columns:[],initColumns:[],img:"assets/python.png", color: "white","description":"Python Code"},
    {"id":37,"name":"ImpalaDb","type":"input","icon": 'fas fa-network-wired', "action":"ImpalaDb","origin":"local",previous:[],form:{Nom_fichier:{type:'fileServer',label:'Nom fichier',value:"",folder:"DB",help:"selection un fichier de format CSV <br> la premier ligne doit contenir les noms des colonnes"}, Query:{type:'textarea',label:'Query',value:"", disable:1}}, size: 1, next: [], outPutColumns:[],columns:[],initColumns:[], img:"assets/impalaDb.png",color: "white","description":"Select Data Fram Impala"},
    {"id":38,"name":"ImpalaSql","type":"input","icon": 'fas fa-network-wired', "action":"ImpalaSql","origin":"local",previous:[],form:{Query:{type:'textarea',label:'Query',value:"", disable:1}}, size: 1, next: [], outPutColumns:[],columns:[],initColumns:[], img:"assets/impalaSql.png",color: "white","description":"Select Data Fram Impala"},
    {"id":39,"name":"FileMail","type":"sending","icon": 'fas fa-network-wired', "action":"FileMail","origin":"local",form:{FileName:{type:'text',label:'FileName',value:""},Destination:{type:'text',label:'Destination',value:""},Objet:{type:'text',label:'Objet',value:""},body:{type:'textarea',label:'body',value:""}},previous:[], size: 1, next: [], columns:[],initColumns:[],outPutColumns:[], img:"assets/attachFileMail.png", color: "white","description":"write to csv"},
    {"id":40,"name":"Mails","type":"sending","icon": 'fas fa-network-wired', "action":"Mails","origin":"local",paramValue:[["Destination","body"]],form:{Destination:{type:'select',label:'Destination',value:"",paramValue:[]},Objet:{type:'text',label:'Objet',value:""},body:{type:'select',label:'body',value:"",paramValue:[]}},previous:[], size: 1, next: [], columns:[],initColumns:[],outPutColumns:[], img:"assets/mails1.png", color: "white","description":"write to csv"},
    {"id":41,"name":"FixMails","type":"sending","icon": 'fas fa-network-wired', "action":"FixMails","origin":"local",paramValue:[["Destination"]],form:{Destination:{type:'select',label:'Destination',value:"",paramValue:[]},Objet:{type:'text',label:'Objet',value:""},body:{type:'textarea',label:'body',value:""}},previous:[], size: 1, next: [],columns:[],initColumns:[],outPutColumns:[], img:"assets/fixmails.png", color: "white","description":"write to csv"},
    {"id":42,"name":"Sms","type":"sending","icon": 'fas fa-network-wired', "action":"Sms","origin":"local",paramValue:[["Destination","body"]],form:{Destination:{type:'select',label:'Destination',value:"",paramValue:[]},Objet:{type:'text',label:'Objet',value:""},body:{type:'select',label:'body',value:"",paramValue:[]}},previous:[], size: 1, next: [], columns:[],initColumns:[],outPutColumns:[], img:"assets/sms.png", color: "white","description":"write to csv"},
    {"id":43,"name":"FixSms","type":"sending","icon": 'fas fa-network-wired', "action":"FixSms","origin":"local",paramValue:[["Destination"]],form:{Destination:{type:'select',label:'Destination',value:"",paramValue:[]},Objet:{type:'text',label:'Objet',value:""},body:{type:'textarea',label:'body',value:""}},previous:[], size: 1, next: [], columns:[],initColumns:[],outPutColumns:[], img:"assets/fixsms.png", color: "white","description":"write to csv"},
    {"id":44,"name":"outputCSV","type":"output","icon": 'fas fa-network-wired', "action":"outputCSV","origin":"local",form:{Destination:{type:'fileServer',label:'Destination',value:"output",folder:"."},folder:{type:'savefile',label:'folder',value:"folder"},Target_Nom:{type:'text',label:'Target Nom',value:"output.csv"}},previous:[], size: 1, next: [], columns:[],initColumns:[],outPutColumns:[], img:"assets/csv.png", color: "white","description":"write to csv"},  
    {"id":45,"name":"schedular","type":"input","origin":"local",previous:[],form:{Destination:{type:'fileServer',label:'Destination',value:"",help:"",folder:"code"},Active:{type:'select',label:'Active',value:'0',paramValue:['0','1']},Minute:{type:'select',label:'Minute',value:'*',paramValue:['*','0','5','10','15','20','25','30','35','40','45','50','55']},
   
   
        Hour:{type:'select',label:'Hour',value:'*',paramValue:['*','0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23']},
    day_of_month:{type:'select',label:'day of month',value:'*',paramValue:['*','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31']},
    Month:{type:'select',label:'Month',value:'*',paramValue:['*','1','2','3','4','5','6','7','8','9','10','11','12']},
    day_of_week:{type:'select',label:'day of week',value:'*',paramValue:['*','1','2','3','4','5','6','7']}}, size: 1, next: [], outPutColumns:[],columns:[],initColumns:[], img:"assets/Cron.png",color: "white","description":"Select Data Fram Impala"},
    {"id":31,"idmodule":5,"type":"output", "action":"plot", "name": "plot",paramValue:[["Plot_X","Plot_Y"]],  size: 1,previous:[], next: [], outPutColumns:[],columns:[],form:{Plot_Type1:{type:'select',label:'Plot Type1',value:'',paramValue:['plot','hist','bar','scatter','pie'],help:""},Plot_X:{type:'select',label:'Plot X',value:'',paramValue:[],help:""},Plot_Y:{type:'select',label:'Plot Y',value:'',paramValue:[]}},img:"assets/plot.png", color: "white",x_label:"id",y_label:"montant",plot_title:"title",plot_type:"bar",top:50, left:300 },
   
    {"id":51,"idmodule":5, "type":"output", "action":"plotGausPDF", "name": "plotGausPDF",  paramValue:[["Plot_Column"]],size: 1,previous:[], next: [], outPutColumns:[],form:{Plot_Column:{type:'select',label:'Plot Column',value:'',paramValue:[],help:""}}, color: "white",x_label:"id",y_label:"montant",plot_title:"title",plot_type:"bar",top:50, left:300 },
   {"id":61,"idmodule":5, "type":"output", "action":"plotGausse", "name": "plotGausse", paramValue:[["Plot_Column"]],size: 1,previous:[], next: [], outPutColumns:[],form:{Plot_Column:{type:'select',label:'Plot Column',value:'',paramValue:[],help:""}}, color: "white",x_label:"id",y_label:"montant",plot_title:"title",plot_type:"bar",top:50, left:300 },
   {"id":9 ,"idmodule":9,"name":"plotHistogramAttributes","type":"output","origin":"local",previous:[],form:[], size: 1, next: [], outPutColumns:[],img:"assets/plot.png", color: "white","description":"plot histogram of the attributes"},
   {"id":10,"idmodule":10,"name":"plotBox","type":"output","origin":"local",previous:[],form:[], size: 1, next: [], outPutColumns:[],img:"assets/plot.png", color: "white","description":"plot box"},
   {"id":11,"idmodule":11,"name":"plotClustering","type":"output","origin":"local",previous:[],form:[], size: 1, next: [], outPutColumns:[],img:"assets/plot.png", color: "white","description":"plot clustering"},
   {"id":12,"idmodule":12,"name":"plotDendrograms","type":"output","origin":"local",previous:[],form:[], size: 1, next: [], outPutColumns:[],img:"assets/plot.png", color: "white","description":"plot Dendrograms"},
  
   {"id":14,"idmodule":14,"name":"plotAcpCoude","type":"output","origin":"local",previous:[],form:[], size: 1, next: [], outPutColumns:[],img:"assets/plotAcp.png", color: "white","description":"plot for debug"},
   {"id":14,"idmodule":14,"name":"plotAcpVariance","type":"output","origin":"local",previous:[],form:[], size: 1, next: [], outPutColumns:[],img:"assets/plotAcpVariance.png", color: "white","description":"plot for debug"},
   {"id":14,"idmodule":14,"name":"plotKmeans","type":"output","origin":"local",previous:[],form:{Nombre_Cluster:{type:'text',label:'Nombre Cluster',value:''}}, size: 1, next: [], outPutColumns:[],img:"assets/plotKmeans.png", color: "white","description":"plot for debug"},
   {"id":14,"idmodule":14,"name":"plotdebug","type":"output","origin":"local",previous:[],form:[], size: 1, next: [], outPutColumns:[], color: "white","description":"plot for debug"},
   {"id":23,"idmodule":26,"name":"plotConfusionMatrix","type":"output","origin":"local",previous:[],form:[], size: 1, next: [], img:"assets/confusionMatrix.png",outPutColumns:[], color: "white","description":"plotConfusionMatrix"}
     
]


public plotModule : any[]=[

  {"id":31,"idmodule":5,"type":"output", "action":"plot", "name": "plot",paramValue:[["Plot_X","Plot_Y"]],  size: 1,previous:[], next: [], outPutColumns:[],form:{Plot_Type1:{type:'select',label:'Plot Type1',value:'',paramValue:['plot','hist','bar','scatter','pie'],help:""},Plot_X:{type:'select',label:'Plot X',value:'',paramValue:[],help:""},Plot_Y:{type:'select',label:'Plot Y',value:'',paramValue:[]}},img:"assets/plot.png", color: "white",x_label:"id",y_label:"montant",plot_title:"title",plot_type:"bar",top:50, left:300 },
   
  {"id":51,"idmodule":5, "type":"output", "action":"plotGausPDF", "name": "plotGausPDF",  paramValue:[["Plot_Column"]],size: 1,previous:[], next: [], outPutColumns:[],form:{Plot_Column:{type:'select',label:'Plot Column',value:'',paramValue:[],help:""}}, color: "white",x_label:"id",y_label:"montant",plot_title:"title",plot_type:"bar",top:50, left:300 },
 {"id":61,"idmodule":5, "type":"output", "action":"plotGausse", "name": "plotGausse", paramValue:[["Plot_Column"]],size: 1,previous:[], next: [], outPutColumns:[],form:{Plot_Column:{type:'select',label:'Plot Column',value:'',paramValue:[],help:""}}, color: "white",x_label:"id",y_label:"montant",plot_title:"title",plot_type:"bar",top:50, left:300 },
 {"id":9 ,"idmodule":9,"name":"plotHistogramAttributes","type":"output","origin":"local",previous:[],form:[], size: 1, next: [], outPutColumns:[],img:"assets/plot.png", color: "white","description":"plot histogram of the attributes"},
 {"id":10,"idmodule":10,"name":"plotBox","type":"output","origin":"local",previous:[],form:[], size: 1, next: [], outPutColumns:[],img:"assets/plot.png", color: "white","description":"plot box"},
 {"id":11,"idmodule":11,"name":"plotClustering","type":"output","origin":"local",previous:[],form:[], size: 1, next: [], outPutColumns:[],img:"assets/plot.png", color: "white","description":"plot clustering"},
 {"id":12,"idmodule":12,"name":"plotDendrograms","type":"output","origin":"local",previous:[],form:[], size: 1, next: [], outPutColumns:[],img:"assets/plot.png", color: "white","description":"plot Dendrograms"},

 {"id":14,"idmodule":14,"name":"plotAcpCoude","type":"output","origin":"local",previous:[],form:[], size: 1, next: [], outPutColumns:[],img:"assets/plotAcp.png", color: "white","description":"plot for debug"},
 {"id":14,"idmodule":14,"name":"plotAcpVariance","type":"output","origin":"local",previous:[],form:[], size: 1, next: [], outPutColumns:[],img:"assets/plotAcpVariance.png", color: "white","description":"plot for debug"},
 {"id":14,"idmodule":14,"name":"plotKmeans","type":"output","origin":"local",previous:[],form:{Nombre_Cluster:{type:'text',label:'Nombre Cluster',value:''}}, size: 1, next: [], outPutColumns:[],img:"assets/plotKmeans.png", color: "white","description":"plot for debug"},
 {"id":14,"idmodule":14,"name":"plotdebug","type":"output","origin":"local",previous:[],form:[], size: 1, next: [], outPutColumns:[], color: "white","description":"plot for debug"},
 {"id":23,"idmodule":26,"name":"plotConfusionMatrix","type":"output","origin":"local",previous:[],form:[], size: 1, next: [], img:"assets/confusionMatrix.png",outPutColumns:[], color: "white","description":"plotConfusionMatrix"}
]



  @Input()
  nodes: any[];
  @Input()
  drawingData: string;
  @Input()
  locked: boolean;
  @Input()
  showLock: boolean;
  @Input()
  showNodes: boolean;
  @Input()
  otherDetails: any;

 // @ViewChild(FactorialComponent, { static: false })  childC!: FactorialComponent;
 
   transform = '';
  editor!: any;
  editDivHtml: HTMLElement;
  editButtonShown: boolean = false;

  drawnNodes: any[] = [];
  selectedNodeId: string;
  selectedNode: any = {};

  lastMousePositionEv: any;
  /////////////////////////
  showConf:boolean=false;
  mobile_item_selec: string;
  mobile_last_move: TouchEvent | null;
  userData :any= {};

  public moduleInput: any[] = []; //input modules
  public moduleOutput: any[] = []; //output modules
  public moduleSending : any[] = []; //output modules
  public moduletreat: any[] = []; //treatements modules
  public moduleDebug: any[] = []; //treatements modules
  public moduleSpark: any[] = [];
  public moduleMachine: any[] = [];

  constructor(public matDialog: MatDialog,
    private http: HttpClient,
    private zone: NgZone,
    public send: BehaviorService,
    public behaviorService: BehaviorService) { }
   dataToImport:any = { "drawflow": { "Home": { "data": { 
    "2": { "id": 2, "name": "slack", "data": {}, "class": "slack", "html": "\n          <div>\n            <div class=\"title-box\" class=\"box dbclickbox\" ondblclick=\"showpopup(event)\"><i class=\"fab fa-slack\"></i> Slack chat message</div>\n          </div>\n          ", "typenode": false, "inputs": { "input_1": { "connections": [{ "node": "7", "input": "output_1" }] } }, "outputs": {}, "pos_x": 1028, "pos_y": 87 }, "3": { "id": 3, "name": "telegram", "data": { "channel": "channel_2" }, "class": "telegram", "html": "\n          <div>\n            <div class=\"title-box\"><i class=\"fab fa-telegram-plane\"></i> Telegram bot</div>\n            <div class=\"box\">\n              <p>Send to telegram</p>\n              <p>select channel</p>\n              <select df-channel>\n                <option value=\"channel_1\">Channel 1</option>\n                <option value=\"channel_2\">Channel 2</option>\n                <option value=\"channel_3\">Channel 3</option>\n                <option value=\"channel_4\">Channel 4</option>\n              </select>\n            </div>\n          </div>\n          ", "typenode": false, "inputs": { "input_1": { "connections": [{ "node": "7", "input": "output_1" }] } }, "outputs": {}, "pos_x": 1032, "pos_y": 184 }, "4": { "id": 4, "name": "email", "data": {}, "class": "email", "html": "\n            <div>\n              <div class=\"title-box\"><i class=\"fas fa-at\"></i> Send Email </div>\n            </div>\n            ", "typenode": false, "inputs": { "input_1": { "connections": [{ "node": "5", "input": "output_1" }] } }, "outputs": {}, "pos_x": 1033, "pos_y": 439 }, "5": { "id": 5, "name": "template", "data": { "template": "Write your template" }, "class": "template", "html": "\n            <div>\n              <div class=\"title-box\"><i class=\"fas fa-code\"></i> Template</div>\n              <div class=\"box\">\n                Ger Vars\n                <textarea df-template></textarea>\n                Output template with vars\n              </div>\n            </div>\n            ", "typenode": false, "inputs": { "input_1": { "connections": [{ "node": "6", "input": "output_1" }] } }, "outputs": { "output_1": { "connections": [{ "node": "4", "output": "input_1" }, { "node": "11", "output": "input_1" }] } }, "pos_x": 607, "pos_y": 304 }, "6": { "id": 6, "name": "github", "data": { "name": "https://github.com/jerosoler/Drawflow" }, "class": "github", "html": "\n          <div>\n            <div class=\"title-box\"><i class=\"fab fa-github \"></i> Github Stars</div>\n            <div class=\"box\">\n              <p>Enter repository url</p>\n            <input type=\"text\" df-name>\n            </div>\n          </div>\n          ", "typenode": false, "inputs": {}, "outputs": { "output_1": { "connections": [{ "node": "5", "output": "input_1" }] } }, "pos_x": 341, "pos_y": 191 }, "7": { "id": 7, "name": "facebook", "data": {}, "class": "facebook", "html": "\n        <div>\n          <div class=\"title-box\"><i class=\"fab fa-facebook\"></i> Facebook Message</div>\n        </div>\n        ", "typenode": false, "inputs": {}, "outputs": { "output_1": { "connections": [{ "node": "2", "output": "input_1" }, { "node": "3", "output": "input_1" }, { "node": "11", "output": "input_1" }] } }, "pos_x": 347, "pos_y": 87 }, "11": { "id": 11, "name": "log", "data": {}, "class": "log", "html": "\n            <div>\n              <div class=\"title-box\"><i class=\"fas fa-file-signature\"></i> Save log file </div>\n            </div>\n            ", "typenode": false, "inputs": { "input_1": { "connections": [{ "node": "5", "input": "output_1" }, { "node": "7", "input": "output_1" }] } }, "outputs": {}, "pos_x": 1031, "pos_y": 363 } } }, "Other": { "data": { "8": { "id": 8, "name": "personalized", "data": {}, "class": "personalized", "html": "\n            <div>\n              Personalized\n            </div>\n            ", "typenode": false, "inputs": { "input_1": { "connections": [{ "node": "12", "input": "output_1" }, { "node": "12", "input": "output_2" }, { "node": "12", "input": "output_3" }, { "node": "12", "input": "output_4" }] } }, "outputs": { "output_1": { "connections": [{ "node": "9", "output": "input_1" }] } }, "pos_x": 764, "pos_y": 227 }, "9": { "id": 9, "name": "dbclick", "data": { "name": "Hello World!!" }, "class": "dbclick", "html": "\n            <div>\n            <div class=\"title-box\"><i class=\"fas fa-mouse\"></i> Db Click</div>\n              <div class=\"box dbclickbox\" ondblclick=\"showpopup(event)\">\n                Db Click here\n                <div class=\"modal\" style=\"display:none\">\n                  <div class=\"modal-content\">\n                    <span class=\"close\" onclick=\"closemodal(event)\">&times;</span>\n                    Change your variable {name} !\n                    <input type=\"text\" df-name>\n                  </div>\n\n                </div>\n              </div>\n            </div>\n            ", "typenode": false, "inputs": { "input_1": { "connections": [{ "node": "8", "input": "output_1" }] } }, "outputs": { "output_1": { "connections": [{ "node": "12", "output": "input_2" }] } }, "pos_x": 209, "pos_y": 38 }, "12": { "id": 12, "name": "multiple", "data": {}, "class": "multiple", "html": "\n            <div>\n              <div class=\"box\">\n                Multiple!\n              </div>\n            </div>\n            ", "typenode": false, "inputs": { "input_1": { "connections": [] }, "input_2": { "connections": [{ "node": "9", "input": "output_1" }] }, "input_3": { "connections": [] } }, "outputs": { "output_1": { "connections": [{ "node": "8", "output": "input_1" }] }, "output_2": { "connections": [{ "node": "8", "output": "input_1" }] }, "output_3": { "connections": [{ "node": "8", "output": "input_1" }] }, "output_4": { "connections": [{ "node": "8", "output": "input_1" }] } }, "pos_x": 179, "pos_y": 272 } } } } }

    public user:string="";
    progress = 0;
    uniqueDialogConfId =0

  ngOnInit() {
      this.updateModulePanel('python')
       // Subscribe to BehaviorService updates
      this.behaviorService.SendMonotoring.subscribe((data) => {
        this.progress = data.progress; // Update the progress bar
      console.log(" drowwwwwwwwwww   recive monotoring ",this.progress)
      
      });





    console.log("   InputDrawflow     ",JSON.stringify(this.InputDrawflow))
    try {
      this.userData = JSON.parse(localStorage.getItem("userData")!);
      
      console.log( "user data is ok "+JSON.stringify(this.userData))
      if (!this.userData || !this.userData.drawflow || !this.userData.drawflow.Home) {
          throw new Error("Invalid drawflow data structure.");
      }
  } catch (error) {
      console.error("Error parsing userData from localStorage:", error);
      this.userData = this.dataToImport; // Fallback to default data
      localStorage.setItem("userData", JSON.stringify(this.dataToImport));
  }
  }

  ngAfterViewInit(): void {
    this.initDrawingBoard();
    // this.editor.editor_mode = this.locked != null && this.locked == false ? 'edit' : 'fixed';
    //const nodeIdToSelect = "8"; // Replace with the actual ID of noeudIS

    // Check if the node exists
    //const node = this.editor.drawflow.drawflow.Home.data[`${nodeIdToSelect}`];//this.editor.getNodeFromId(nodeIdToSelect);
    //if (node) {
      // Highlight/select the node
    //  this.selectNode(nodeIdToSelect);
    //} else {
    //  console.error(`Node with ID ${nodeIdToSelect} not found.`);
    //}
  }

  private initDrawingBoard() {
    this.initDrawFlow();
    if (!this.locked) {
      this.addEditorEvents();
      this.dragEvent();
    }
  }

  // Private functions
  private initDrawFlow(): void {
    if (typeof document !== 'undefined') {
      const drawFlowHtmlElement = document.getElementById('drawflow');
      this.editor = new Drawflow(drawFlowHtmlElement as HTMLElement);

      this.editor.reroute = true;
      this.editor.curvature = 0.5;
      this.editor.reroute_fix_curvature = true;
      this.editor.reroute_curvature = 0.5;
      this.editor.force_first_input = false;
      this.editor.line_path = 1;
      this.editor.editor_mode = 'edit';

      this.editor.start();

      // this.editor.createCurvature = function (start_pos_x: any, start_pos_y: any, end_pos_x: any, end_pos_y: any, curvature_value: any, type: any) {
      //   var line_x = start_pos_x; var line_y = start_pos_y; var x = end_pos_x; var y = end_pos_y; var curvature = curvature_value;
      //   switch (type) { default: var hx1 = line_x + Math.abs(x - line_x) * curvature; var hx2 = x - Math.abs(x - line_x) * curvature; let xx = ' M ' + line_x + ' ' + line_y + ' C ' + hx1 + ' ' + line_y + ' ' + (hx2) + ' ' + y + ' ' + (x - 20) + '  ' + y + ' M ' + (x - 11) + ' ' + y + ' L' + (x - 20) + ' ' + (y - 5) + '  L' + (x - 20) + ' ' + (y + 5) + 'Z'; return xx; }
      // }

      this.editor.createCurvature = function (start_pos_x: any, start_pos_y: any, end_pos_x: any, end_pos_y: any, curvature_value: any, type: any) {
        var line_x = start_pos_x;
        var line_y = start_pos_y;
        var x = end_pos_x;
        var y = end_pos_y;
        var curvature = curvature_value;
        switch (type) {
          default:
            var hx1 = line_x + Math.abs(x - line_x) * curvature;
            var hx2 = x - Math.abs(x - line_x) * curvature;        
            return ' M ' + line_x + ' ' + line_y + ' C ' + hx1 + ' ' + line_y + ' ' + hx2 + ' ' + y + ' ' + (x - 21) + '  ' + y + ' M ' + (x - 11) + ' ' + y + ' L' + (x - 20) + ' ' + (y - 5) + '  L' + (x - 20) + ' ' + (y + 5) + ' Z' + ' M ' + (x - 11) + ' ' + y + ' L' + (x - 20) + ' ' + (y - 3) + '  L' + (x - 20) + ' ' + (y + 3) + ' Z' + ' M ' + (x - 11) + ' ' + y + ' L' + (x - 20) + ' ' + (y - 1) + '  L' + (x - 20) + ' ' + (y + 1) + ' Z';
        }
      }
      this.updateEditor(this.userData)
      // to tester, load draw
     /*  this.editor.import(this.userData);
       console.log(JSON.stringify(this.userData)," ngIf=userData!=editor[drawflow] ",this.userData!=this.editor['drawflow']," ngIf ",JSON.stringify(JSON.stringify(this.editor.drawflow)))
       document.addEventListener("DOMContentLoaded", () => {
       // const nodes = document.querySelectorAll(".dbclickbox");
        setTimeout(() => {
          const nodes = document.querySelectorAll('.dbclickbox[data-action="show-popup"]');
          nodes.forEach(node => {
            node.addEventListener('dblclick', this.showPopup.bind(this));
          });
        
          const closeButtons = document.querySelectorAll('.close[data-action="close-modal"]');
          closeButtons.forEach(btn => {
            btn.addEventListener('click', this.closeModal.bind(this));
          });
        });
        //nodes.forEach((node) => {
        //  node.addEventListener("dblclick", (event) => {
            //let projectConf :any ={"action":"inputCSV","id":5,"type":"input","currentModule":["inputCSV"],"droppedModules":[],"form":{"Nom_fichier":{"type":"fileServer","label":"Nom fichier","value":"","folder":"input","content":[],"help":{"text_top":"selection un fichier de format CSV \n la premier ligne doit contenir les noms des colonnes"}},"Separateur":{"type":"text","label":"Separateur","value":",","help":{"text_top":"Separateur111 \n","text_buttom":" \nhelp","image":"assets/logoAnalytics.png"}},"Delete_After":{"type":"checkbox1","label":"Delete After","value":0}}}
  
        //    this.showPopup(event); // Your function for handling the event
        //  });
        //});
      });*/
    }
  }


  selectNode(nodeId: string) {
    // Ensure the node is part of the editor
    console.log(`Node ${nodeId} selected`)
    const node = this.editor.getNodeFromId(nodeId);
    if (node) {
      // Log the selected node
      console.log(`Node ${nodeId} selected`, JSON.stringify(node));
  
      // Remove the current selection (if any)
      //document.querySelectorAll('.drawflow .drawflow-node.selected').forEach((el) => {
      //  el.classList.remove('selected'); // Remove the selected class
      //});
  
      // Get the HTML element for the selected node
      const nodeElement = document.querySelector(`#node-${nodeId}`) as HTMLElement;
      if (nodeElement) {
        // Apply the visual selection by adding the 'selected' class
        nodeElement.classList.add('selected'); // This will trigger the CSS changes
        console.log(`Node ${nodeId} visually selected with new styles.`);
      } else {
        console.error(`DOM element for node ${nodeId} not found.`);
      }
    } else {
      console.error(`Node ${nodeId} not found in the editor.`);
    }
  }


  removeSelectNode(nodeId: string) {
    // Ensure the node is part of the editor
    const node = this.editor.getNodeFromId(nodeId);
    if (node) {
      // Log the selected node
    //  console.log(`Node ${nodeId} selected`, JSON.stringify(node));
  
      // Remove the current selection (if any)
    //  document.querySelectorAll('.drawflow .drawflow-node.selected').forEach((el) => {
    //    el.classList.remove('selected'); // Remove the selected class
    //  });
  
      // Get the HTML element for the selected node
      const nodeElement = document.querySelector(`#node-${nodeId}`) as HTMLElement;
      if (nodeElement) {
        // Apply the visual selection by adding the 'selected' class
        nodeElement.classList.remove('selected'); // This will trigger the CSS changes
        console.log(`Node ${nodeId} visually selected with new styles.`);
      } else {
        console.error(`DOM element for node ${nodeId} not found.`);
      }
    } else {
      console.error(`Node ${nodeId} not found in the editor.`);
    }
  }

  removeAllSelectNode() {
      // Remove the current selection (if any)
      document.querySelectorAll('.drawflow .drawflow-node.selected').forEach((el) => {
       el.classList.remove('selected'); // Remove the selected class
      });
  
      
  }
  
  
  geteditorData(){
    return   this.editor.drawflow; // this.userData;
    

  }
  updateEditor(data: any) {
    console.log("updateEditor");
    try {
    this.editor.import(data); // Update the editor with the new data
    }catch (error) {
      this.editor.import({ "drawflow": { "Home": { "data": {}}}});
    }
    // Ensure event listeners are added after the DOM elements are updated
    console.log("updateEditor before adding event listeners");
    
    setTimeout(() => {
      const nodes = document.querySelectorAll('.dbclickbox[data-action="show-popup"]');
      nodes.forEach(node => {
        node.addEventListener('dblclick', this.showPopup.bind(this));
      });
      
      const closeButtons = document.querySelectorAll('.close[data-action="close-modal"]');
      closeButtons.forEach(btn => {
        btn.addEventListener('click', this.closeModal.bind(this));
      });
  
      console.log("Event listeners added to .dbclickbox and .close elements");
    }, 0); // Use a short delay to ensure DOM is updated before adding listeners
  }
  

  private addEditorEvents() {
    // Events!
    this.editor.on('nodeCreated', (id: any) => {
     // console.log('Editor Event :>> Node created ' + id, this.editor.getNodeFromId(id));
    });

    this.editor.on('nodeRemoved', (id: any) => {
     // console.log('Editor Event :>> Node removed ' + id);
    });

    this.editor.on('nodeSelected', (id: any) => {
     // console.log('Editor Event :>> Node selected ' + id, this.editor.getNodeFromId(id));
      this.selectedNode = this.editor.drawflow.drawflow.Home.data[`${id}`];
     // console.log('Editor Event :>> Node selected :>> this.selectedNode :>> ', this.selectedNode);
     // console.log('Editor Event :>> Node selected :>> this.selectedNode :>> ', this.selectedNode.data);
    });

    this.editor.on('click', (e: any) => {
     // console.log('Editor Event :>> Click :>> ', e);
      this.removeAllSelectNode()
      if (e.target.closest('.drawflow_content_node') != null || e.target.classList[0] === 'drawflow-node') {
        if (e.target.closest('.drawflow_content_node') != null) {
          this.selectedNodeId = e.target.closest('.drawflow_content_node').parentElement.id;
        } else {
          this.selectedNodeId = e.target.id;
        }
        this.selectedNode = this.editor.drawflow.drawflow.Home.data[`${this.selectedNodeId.slice(5)}`];
      }

      if (e.target.closest('#editNode') != null || e.target.classList[0] === 'edit-node-button') {
        // Open modal with Selected Node
        // this.open(this.nodeModal, this.selectedNodeId);
      }

      if (e.target.closest('#editNode') === null) {
        this.hideEditButton();
      }
    });

    this.editor.on('moduleCreated', (name: any) => {
     // console.log('Editor Event :>> Module Created ' + name);
    });

    this.editor.on('moduleChanged', (name: any) => {
     // console.log('Editor Event :>> Module Changed ' + name);
    });

    this.editor.on('connectionCreated', (connection: any) => {
      console.log('Editor Event :>> Connection created ', connection);
    this.actionHandler01(connection)
    
    });

  
  

    this.editor.on('connectionRemoved', (connection: any) => {
     // console.log('Editor Event :>> Connection removed ', connection);
     this.actionHandlerRemoveLink(connection)
    });

   

    this.editor.on('zoom', (zoom: any) => {
     // console.log('Editor Event :>> Zoom level ' + zoom);
    });

    this.editor.on('addReroute', (id: any) => {
     // console.log('Editor Event :>> Reroute added ' + id);
    });

    this.editor.on('removeReroute', (id: any) => {
     // console.log('Editor Event :>> Reroute removed ' + id);
    });
    this.editor.on('mouseOver', (id: any) => {
      //console.log('Editor Event :>> Position mouse over:' + id);
    });
    this.editor.on('mouseMove', (position: any) => {
      //console.log('Editor Event :>> Position mouse x:' + position.x + ' y:' + position.y);
    });

    this.editor.on('nodeMoved', (id: any) => {
     // console.log('Editor Event :>> Node moved ' + id);
    });

    this.editor.on('translate', (position: any) => {
      console.log(
        'Editor Event :>> Translate x:' + position.x + ' y:' + position.y
      );
    });
  }
/////  actionHandlerRemoveLInk 
actionHandlerRemoveLink(connection:any) {

  const linkOne:string=connection['output_id'];
  const moduleLinkOne=this.editor.drawflow.drawflow.Home.data[linkOne]['data']['idmodule']
  const index:string=connection['input_id'];
  const moduleIndex =this.editor.drawflow.drawflow.Home.data[index]['data']['idmodule']
  
  let ar:string[] =this.editor.drawflow.drawflow.Home.data[linkOne]['data']['next'];
  ar = ar.filter((item :string) => item !== moduleIndex);
  this.editor.drawflow.drawflow.Home.data[linkOne]['data']['next']=ar
  ar=this.editor.drawflow.drawflow.Home.data[index]['data']['previous'];
  ar = ar.filter((item :string) => item !== moduleLinkOne);
  this.editor.drawflow.drawflow.Home.data[index]['data']['previous']=ar

}

isEmptyObject(obj: object): boolean {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}
////  actionHandler after link
actionHandler01(connection:any) {

  const linkOne:string=connection['output_id'];
  const moduleLinkOne=this.editor.drawflow.drawflow.Home.data[linkOne]['data']['idmodule']
  const index:string=connection['input_id'];
  const moduleIndex =this.editor.drawflow.drawflow.Home.data[index]['data']['idmodule']
  
  this.editor.drawflow.drawflow.Home.data[linkOne]['data']['next'].push(moduleIndex)
  this.editor.drawflow.drawflow.Home.data[index]['data']['previous'].push(moduleLinkOne)

  //this.editor.drawflow.drawflow.Home.data[linkOne]['data']['previous'].push(connection['output_id'])
  //this.editor.drawflow.drawflow.Home.data[index]['data']['next'].push(connection['intput_id'])

  console.log(linkOne, " ---  to --->",index,"  draflow  wwwwwwwwwwwwwww ",JSON.stringify(this.editor.drawflow.drawflow.Home.data))
  let output = this.editor.drawflow.drawflow.Home.data[linkOne]['outputs']['output_1']['connections']
   
  const result = output.map((item:any) => item.node);
  if (!this.isEmptyObject(output)) console.log(result," connecxion  previous   ",JSON.stringify(output))
  let output1 = this.editor.drawflow.drawflow.Home.data[index]['outputs']
  let input1 = this.editor.drawflow.drawflow.Home.data[index]['inputs']['input_1']['connections']
  const result1 = input1.map((item:any) => item.node);
  console.log(" connecxion index   ",result1)

  var idModule;
  var groubyAxe=[]
  var aggVerbe=[]
  //console.log('parent  validate data '+JSON.stringify(data))
  idModule=linkOne;
 
  ////console.log('all object  ',this.editor.drawflow.drawflow.Home.data)
   const data = this.editor.drawflow.drawflow.Home.data[linkOne];
  ////console.log('selected object idModule ',idModule,' index ',index)
     console.log(" draflow dataaaaaaaaaaaaaaaaa  ",JSON.stringify(data))
  // const ar=data.map((el:any)=> el['column'])
  let  ar = data.data['columns'] || []; // Default to an empty array if columns is undefined
   if ( data.data['outPutColumns'] != undefined) ar = data.data['outPutColumns'] || []
  console.log('parent validate data', ar);
  //console.log('parent  validate data ',ar)
  if (ar.length==0 && this.editor.drawflow.drawflow.Home.data[index]['data']['action'] !='ImpalaAgg' ) {
    alert('you should select one or more columns')
    return 0
  }else {
    //!!! modif 23/04/2022 this.editor.drawflow.drawflow.Home.data[index]['data']['columns']=ar
    //console.log('parent  validate data ??????????????  ',this.editor.drawflow.drawflow.Home.data[index]['data']['columns'])
  //for backup
  //  this.editor.drawflow.drawflow.Home.data[index]['data']['columns']=ar;
  //  this.editor.drawflow.drawflow.Home.data[index]['data']['outPutColumns']=ar;
  //this.editor.drawflow.drawflow.Home.data[index]['data']['columns']=this.editor.drawflow.drawflow.Home.data[index]['data']['columns'].concat(ar);
  //this.editor.drawflow.drawflow.Home.data[index]['data']['outPutColumns']=this.editor.drawflow.drawflow.Home.data[index]['data']['outPutColumns'].concat(ar);
  this.editor.drawflow.drawflow.Home.data[index]['data']['columns'] = Array.from(new Set([...this.editor.drawflow.drawflow.Home.data[index]['data']['columns'], ...ar]));
  this.editor.drawflow.drawflow.Home.data[index]['data']['outPutColumns'] = Array.from(new Set([...this.editor.drawflow.drawflow.Home.data[index]['data']['outPutColumns'], ...ar]));  
     
    let shipsInBoardIndex : any = this.editor.drawflow.drawflow.Home.data[index]['data'];
    let shipsInBoardPrevious : any = this.editor.drawflow.drawflow.Home.data[linkOne]['data'];
     ////
     if ( shipsInBoardIndex["paramValue"] == undefined ) return 0
     let l =shipsInBoardIndex['previous'].length-1;
    let formParamValues=shipsInBoardIndex["paramValue"][l];
    console.log(" formParamValue paramValue ",formParamValues)
    if (formParamValues != undefined && formParamValues.length > 0) {
      formParamValues.forEach((formParamValue:any) => {
        console.log(" formParamValue ",formParamValues)
        if (shipsInBoardIndex['form'][formParamValue]) {
          console.log(" formParamValue form  ",shipsInBoardIndex['form'][formParamValue])
          //shipsInBoardIndex['form'][formParamValue]['paramValue'] = shipsInBoardPrevious['outPutColumns'];
          shipsInBoardIndex['form'][formParamValue]['paramValue'] = shipsInBoardPrevious['outPutColumns'];
        }
        console.log(" shipsInBoardIndex['form'][formParamValue] ",shipsInBoardIndex['form'][formParamValue])
      });
    }
    console.log("   paramvalue field ",this.editor.drawflow.drawflow.Home.data[index]['data'])

    return 0
    if ( this.editor.drawflow.drawflow.Home.data[index]['data']['action'] =='aggGroupBy'  || this.editor.drawflow.drawflow.Home.data[index]['data']['action'] =='ImpalaAgg') {
      
      const col =(this.editor.drawflow.drawflow.Home.data[index]['data']['form']['Function']['value']).concat(this.editor.drawflow.drawflow.Home.data[index]['data']['form']['Agg_Column']['value'])
      this.editor.drawflow.drawflow.Home.data[index]['data']['outPutColumns']=(this.editor.drawflow.drawflow.Home.data[index]['data']['columns']).concat(col)
      //console.log(' actionHandler outPutColumns  colfunction  ',col,'   ',this.editor.drawflow.drawflow.Home.data[index]['data']['outPutColumns'])
   }
   else {
     this.editor.drawflow.drawflow.Home.data[index]['data']['outPutColumns']=this.editor.drawflow.drawflow.Home.data[index]['data']['columns']

   }
   if ( this.editor.drawflow.drawflow.Home.data[index]['data']['form']['Query'] !=undefined ) {
   // console.log(' validate update querry ',this.editor.drawflow.drawflow.Home.data[index]['data']['columns'].join(','))
    this.editor.drawflow.drawflow.Home.data[index]['data']['form']['Query']['value']='select '+this.editor.drawflow.drawflow.Home.data[index]['data']['columns'].join(',')+' from  '+this.editor.drawflow.drawflow.Home.data[index]['data']['form']['Nom_fichier'].value.replace('.json',' ');
    
    let form =  this.editor.drawflow.drawflow.Home.data[index]['data']['form']

    let data1 ={action:this.editor.drawflow.drawflow.Home.data[index]['data']['action'],id:5,type:this.editor.drawflow.drawflow.Home.data[index]['data']['type'],currentModule:[this.editor.drawflow.drawflow.Home.data[index]['data']['idmodule']],droppedModules:[],form:form}
   
      this.send.SendMessage.next(data1); // call the subject behavior and send config object to config component
     }
  }

        // Generic ParamValue and column 28/01/2023

        // Generic ParamValue and column 28/01/2023
        /*if ( this.editor.drawflow.drawflow.Home.data['index']['data']['form']["paramValue"] != undefined ){
          for (var i = 0; i < this.editor.drawflow.drawflow.Home.data['index']['data']['form']['previous'].length; i++)
              {
                let idModulePrecedent1 = this.editor.drawflow.drawflow.Home.data['index']['data']['form']['previous'][i]
                let indexPreceden1 = this.shipsInBoard.findIndex((el : any) => el.idmodule == idModulePrecedent1)
               let ar1=this.editor.drawflow.drawflow.Home.data['index']['data']['form']['outPutColumns']
                let ar2=this.shipsInBoard[indexPreceden1]['outPutColumns']
                let intersection = ar1.filter((x:string) => ar2.includes(x))
                let inter=ar2.filter((x:string) => !(ar1.includes(x.toUpperCase())||ar1.includes(x.toLowerCase())))
                if ( this.editor.drawflow.drawflow.Home.data['index']['data']['form']['action']!='aggGroupBy')
                this.editor.drawflow.drawflow.Home.data['index']['data']['form']['columns']=ar1.concat(inter)
                
                
                if (this.editor.drawflow.drawflow.Home.data['index']['data']['form']["paramValue"][i] != undefined ){
                let formParamValue=this.editor.drawflow.drawflow.Home.data['index']['data']['form']["paramValue"][i]
                console.log(' formParamValue.length  >>>>>>>>>>>>>>> ', formParamValue.length )
                  for (var j = 0; j < formParamValue.length; j++){
                    console.log(formParamValue[j],' previous >>>>>>>>>>>>>>> ',this.editor.drawflow.drawflow.Home.data['index']['data']['form']['previous'][i])
                    ///console.log(this.shipsInBoard[index]['form'])
                    ///this.shipsInBoard[index]['form'][formParamValue[j]]['paramValue']=ar2
                  }
                }
            }
          }*/

        //console.log(" this.selectedNode.data[paramValue] vvvvvvvvvv ",this.editor.drawflow.drawflow.Home.data[index]['data']['form']['Filter_Column']['paramValue'])
        if ( this.editor.drawflow.drawflow.Home.data[index]['data']['form']['Filter_Column']['paramValue'] != undefined /*&& this.selectedNode.data["paramValue"].length>0 */){
          this.editor.drawflow.drawflow.Home.data[index]['data']['form']['Filter_Column']['paramValue']=data.data["outPutColumns"]

          /*
                  console.log(" this.selectedNode.data[paramValue] vvvvvvvvvv ",this.editor.drawflow.drawflow.Home.data[index]['data']['form']['Agg_Column']['paramValue'])
        if ( this.editor.drawflow.drawflow.Home.data[index]['data']['form']['Agg_Column']['paramValue'] != undefined ){
          this.editor.drawflow.drawflow.Home.data[index]['data']['form']['Agg_Column']['paramValue']=data.data["outPutColumns"]
   
          */
          /* for (var i = 0; i < this.editor.drawflow.drawflow.Home.data[index]['Input_in'].length; i++)
              {
                           let ar1=this.selectedNode.data['outPutColumns']
                let ar2=data.data['outPutColumns']
                 let inter=ar2.filter((x:string) => !(ar1.includes(x.toUpperCase())||ar1.includes(x.toLowerCase())))
                if ( this.selectedNode.data['action']!='aggGroupBy')
                this.selectedNode.data['columns']=ar1.concat(inter)
                
                
                if (this.selectedNode.data["paramValue"][i] != undefined ){
                let formParamValue=this.selectedNode.data["paramValue"][i]
                console.log(' formParamValue.length  >>>>>>>>>>>>>>> ', formParamValue.length )
                  for (var j = 0; j < formParamValue.length; j++){
                    console.log(formParamValue[j],' previous >>>>>>>>>>>>>>> ',this.selectedNode.data['previous'][i])
                    console.log(this.selectedNode.data['form'])
                    this.selectedNode.data['form'][formParamValue[j]]['paramValue']=ar2
                  }
                }
            }*/
          }
}

  private dragEvent() {
    var elements = Array.from(document.getElementsByClassName('drag-drawflow'));

    elements.forEach(element => {
      element.addEventListener('touchend', this.drop.bind(this), false);
      element.addEventListener('touchmove', this.positionMobile.bind(this), false);
      element.addEventListener('touchstart', this.drag.bind(this), false);
      element.addEventListener("dblclick", (event) => { });
    });

  }

  private positionMobile(ev: any) {
    this.mobile_last_move = ev;
  }

  public allowDrop(ev: any) {
    ev.preventDefault();
  }

  drag(ev: any) {
    if (ev.type === "touchstart") {
      this.selectedNode = ev.target.closest(".drag-drawflow").getAttribute('data-node');
    } else {
      ev.dataTransfer.setData("node", ev.target.getAttribute('data-node'));
    }
  }

  drop(ev: any) {
    console.log(JSON.stringify(data)," drop ",ev.dataTransfer.getData("node"))
    if (ev.type === "touchend" && this.mobile_last_move) {
      console.log(" ev.type === 'touchend' && this.mobile_last_move ",this.mobile_last_move)
      var parentdrawflow = document.elementFromPoint(this.mobile_last_move.touches[0].clientX, this.mobile_last_move.touches[0].clientY)?.closest("#drawflow");
      if (parentdrawflow != null) {
        this.addNodeToDrawFlow(this.mobile_item_selec, this.mobile_last_move.touches[0].clientX, this.mobile_last_move.touches[0].clientY);
      }
      this.mobile_item_selec = '';
    } else {
      ev.preventDefault();
      var data = ev.dataTransfer.getData("node");
      console.log(" drop  ev.dataTransfer.getData('node') ",JSON.stringify(data))
      this.addNodeToDrawFlow(data, ev.clientX, ev.clientY);
    }
  }

  getDataByName(name: string): any {
   // { id :1  ,name:"pythonCode",icon: 'fas fa-network-wired',  action:"pythonCode",type:"treat","origin":"local",previous:[],columns:[],initColumns:[],form:{Python_Code:{type:'textarea',label:'Python Code',value:'#use previous df as  df_previousModule and current as df_currentModule \ndf_currentModule=df_previousModule \n #for series use df_currentModule=series.to_frame(name=vals).reset_index() \n#for value to dataFrame  d={val:[val]}  df_currentModule=pd.DataFrame.from_dict(d)',paramValue:'',help:""}}, size: 1, next: [], outPutColumns:[],img:"assets/python.png", color: "white","description":"Python Code"},
   const traitModul = cloneDeep(this.traitModule)
    const module = traitModul.find((mod) => mod.name === name);
   //module.remove("id")
   return module
  }
  getIconByName(name: string): string | null {
    const traitModul = cloneDeep(this.traitModule)
    const module = traitModul.find((mod) => mod.name === name);
    return module ? module.icon : null;
  }
  getTypeByName(name: string): string | null {
    const module = this.traitModule.find((mod) => mod.name === name);
    console.log(name, "  getTypeByName yyyyy  ",JSON.stringify(module))
    return module ? module.type : null;
  }
  
  getValueFieldByName(name: string,field:string): string | null {
    const module = this.traitModule.find((mod) => mod.name === name);
    return module ? module[field] : null;
  }

    showComponent(help:any)
  {
    console.log(' showComponent ',JSON.stringify(help))
    const dialogConfig = new MatDialogConfig();
    this.uniqueDialogConfId++; // Increment counter for unique ID
    dialogConfig.id = `modal-ConfConfig-${this.uniqueDialogConfId}`; 
 
       //dialogConfig.height = "450px";
    dialogConfig.width = "500px";
    dialogConfig.data = help // pass help variable to the MatConfComponent
    const modalDialog = this.matDialog.open(MatConfComponent, dialogConfig); // load the help component
    modalDialog.afterClosed().subscribe(result => {
      console.log(" modalDialog.afterClosed().subscribe(result ",JSON.stringify(result))
      if ( result != undefined ){
        this.selectedNode.data["form"]=JSON.parse(result["data"])
 
        if (this.selectedNode.data['action'] == 'folderInput' ||
          this.selectedNode.data['action'] == 'inputCSV' ||
          this.selectedNode.data['action'] == 'inputJSON' ||
          this.selectedNode.data['action'] == 'inputExcel') {
          console.log('this.selectedNode.data[form][Nom_fichier]  sssssssssssssssss ', this.selectedNode.data['form']['Nom_fichier']['columns']);
          let columns: any[] = this.selectedNode.data['form']['Nom_fichier']['columns']
          // this.echangeDataConf={displayedColumns:[],data:[],actionColumns:[],selectedRows:[]}

          this.selectedNode.data['columns'] = columns;
          console.log('validateConfigField data columns folderInput sssssssssssssssss ', this.selectedNode.data['columns'])
          this.selectedNode.data['outPutColumns'] = this.selectedNode.data['columns'];
          this.selectedNode.data['initColumns'] = [];
          this.selectedNode.data['columns'].forEach((a: any) => { let o: any = {}; o['column'] = a; this.selectedNode.data['initColumns'].push(o) })
          console.log('validateConfigField table-fil-sort-pag  data  initColumns  ', this.selectedNode.data)
        }else
        if ( this.selectedNode.data['form']['Columns'] != undefined ){
          this.selectedNode.data['columns']=this.selectedNode.data['form']['Columns']['value']
          this.selectedNode.data['outPutColumns']=this.selectedNode.data['form']['Columns']['value']
          console.log(":: aggGroupBy ::")
        }
         console.log(":: aggGroupBy ::",JSON.stringify(this.selectedNode.data))
        if ( this.selectedNode.data['action'] == 'aggGroupBy' ){
          let aggField:string=this.selectedNode.data['form']['Function']['value']+   this.selectedNode.data['form']['Agg_Column']['value']
          console.log(aggField,":: aggGroupBy :: outPutColumn ",this.selectedNode.data['outPutColumns'])
          let col:string[]=[...this.selectedNode.data['columns']]
          col.push(aggField);
          this.selectedNode.data['outPutColumns']=col
          console.log(this.selectedNode.data['columns'],"  columns:: aggGroupBy ::outPutColumns",this.selectedNode.data['outPutColumns'])
        }


        console.log(this.selectedNode.data["form"], " close dialogue !!!!!! ", JSON.stringify(result))
        this.confElementChanged.emit(result);
      }
    });
  }
private addNodeToDrawFlow(name: string, pos_x: number, pos_y: number) {
    if (this.editor.editor_mode === 'fixed') {
        return false;
    }

    // Get the previous ID and calculate the new position
    var icon = this.getIconByName(name);
    var type = this.getTypeByName(name);
    var module :any=this.getDataByName(name);

    console.log("Type detected: ", type);

    pos_x = pos_x * (this.editor.precanvas.clientWidth / (this.editor.precanvas.clientWidth * this.editor.zoom)) - 
            (this.editor.precanvas.getBoundingClientRect().x * (this.editor.precanvas.clientWidth / (this.editor.precanvas.clientWidth * this.editor.zoom)));
    pos_y = pos_y * (this.editor.precanvas.clientHeight / (this.editor.precanvas.clientHeight * this.editor.zoom)) - 
            (this.editor.precanvas.getBoundingClientRect().y * (this.editor.precanvas.clientHeight / (this.editor.precanvas.clientHeight * this.editor.zoom)));

    // Get a unique ID for the node
    const nodeId = this.editor.nodeId || Math.random(); // Use editor's ID or generate a random one

    // Concatenate name and ID for display
    const label = `${name}${nodeId}`;

    // Define the HTML for the node
    var tag = `
      <div>
        <div class="title-box dbclickbox" data-action="show-popup">
         <div class="icon-text-wrapper">
           <i class="${icon}"></i>
            <span>${label}</span>
          <!--div class="modal" style="display:none">
            <div class="modal-content">
              <span class="close" data-action="close-modal">&times;</span>
              Change your variable ${name}!
              <input type="text" df-name>
            </div>
          </div -->
         </div>
        </div>
      </div>
    `;

    // Get the form data for the node
    var form = this.getValueFieldByName(name, "form");
    console.log(" module ",JSON.stringify(module))
    module["id"]=nodeId;
    module["idmodule"]=label;
    //this.editor.addNode(name, 0, 1, pos_x, pos_y, name, module, tag);

    // Add the node based on its type
    if (type == "input") {
       // this.editor.addNode(name, 0, 1, pos_x, pos_y, name, { form,"id":nodeId,"name":name, "action":name,"type":type,"idmodule":label,"columns":[],"outPutColumns":[],"initColumns":[],"previous":[],"next":[] }, tag);
        this.editor.addNode(name, 0, 1, pos_x, pos_y, name, module, tag);
      
      } else if (type == "output" || type == "Sinding") {
      //  this.editor.addNode(name, 1, 0, pos_x, pos_y, name, { form,"id":nodeId,"name":name, "action":name,"type":type,"idmodule":label,"columns":[],"outPutColumns":[],"initColumns":[] ,"previous":[],"next":[]}, tag);
        this.editor.addNode(name, 1, 0, pos_x, pos_y, name, module, tag);

      }else if (type == "filter") {
      //this.editor.addNode(name, 1, 0, pos_x, pos_y, name, { form,"id":nodeId,"name":name, "action":name,"type":type,"idmodule":label,"columns":[],"outPutColumns":[],"initColumns":[] , "paramValue":[['Filter_Column']],"previous":[],"next":[]}, tag);
      this.editor.addNode(name, 1, 1, pos_x, pos_y, name, module, tag);
  
    } else {
      this.editor.addNode(name, 1, 1, pos_x, pos_y, name, module, tag);
      //  this.editor.addNode(name, 1, 1, pos_x, pos_y, name, { form,"id":nodeId,"name":name, "action":name,"type":type,"idmodule":label,"columns":[],"outPutColumns":[],"initColumns":[],"previous":[],"next":[] }, tag);
    }
   
    console.log("Updated editor nodes: ", this.editor.drawflow.drawflow.Home.data);

    // Attach event listeners for the modal
    setTimeout(() => {
        const nodes = document.querySelectorAll('.dbclickbox[data-action="show-popup"]');
        nodes.forEach(node => {
            node.addEventListener('dblclick', this.showPopup.bind(this));
        });

        const closeButtons = document.querySelectorAll('.close[data-action="close-modal"]');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', this.closeModal.bind(this));
        });
    });

    return true;
}
  save(){
    console.log(" save .... "+JSON.stringify(this.editor.drawflow))
    let rr = JSON.parse(JSON.stringify(this.editor.drawflow))
   localStorage.setItem("userData",JSON.stringify(this.editor.drawflow))
   this.transformEditorToShipBoard()
   if (this.childC != undefined) {
    this.childC.monotoringFlow("log_local_selfAnalytics_203505114050124");
  } else {
    console.error('Child component is not initialized');
  }
   //this.childC.monotoringFlow("log_local_selfAnalytics_203505114050124")
  }

  export() {
    debugger
    const html = JSON.stringify(this.editor.export(), null, 4)
  }

  onClear() {
    this.editor.clear();
    //localStorage.setItem('userData','');
  }

  changeMode() {
    this.locked = !this.locked;
    this.editor.editor_mode = this.locked != null && this.locked == false ? 'edit' : 'fixed';
  }

  onZoomOut() {
    this.editor.zoom_out();
  }

  onZoomIn() {
    this.editor.zoom_in();
  }

  onZoomReset() {
    this.editor.zoom_reset();
  }

  exportDrawingData() {
    return this.editor.export();
  }

  onSubmit() {
    this.drawingData = this.exportDrawingData();
  }


  private hideEditButton() {
    this.editButtonShown = false;
    this.editDivHtml = document.getElementById('editNode')!;
    if (this.editDivHtml) {
      this.editDivHtml.remove();
    }
  }

  
 
  showPopup(event: any): void {
    console.log(" showPopup ",JSON.stringify(event.target.closest))
    let help:any={"text_top":"help top text",
                 "text_bottom":""}
    help={ id:13,name:"pythonCode", icon: 'fas fa-network-wired',action:"pythonCode",type:"treat","origin":"local",previous:[],columns:[],initColumns:[],form:{Python_Code:{type:'textarea',label:'Python Code',value:'#use previous df as  df_previousModule and current as df_currentModule \ndf_currentModule=df_previousModule \n #for series use df_currentModule=series.to_frame(name=vals).reset_index() \n#for value to dataFrame  d={val:[val]}  df_currentModule=pd.DataFrame.from_dict(d)',paramValue:'',help:""}}, size: 1, next: [], outPutColumns:[],img:"assets/python.png", color: "white","description":"Python Code"}
    let project = { 'idparent':1, "auteur":"mounir", "fileName":"myproject1.json","update":'02/02/2023'}
    const titleBox = event.target.closest('.title-box');
    //this.selectedNode = this.editor.drawflow.drawflow.Home.data[`${id}`];
   
    // Check if the element is valid and extract the text content
    if (titleBox) {
      const label = titleBox.textContent.trim(); // Extract the label (e.g., "Facebook")
        console.log(this.selectedNode,  " showPopup Element selected:", label);
    } else {
      console.warn(" showPopup Clicked element does not have a title-box parent.");
    }
 
    let projectConf :any ={"action":"inputCSV","id":5,"type":"input","currentModule":[this.selectedNode.name+this.selectedNode.id],"droppedModules":[],"form":this.selectedNode.data["form"]}
    this.send.SendMessage.next(projectConf)
    //this.loadSelectionList(help)
    this.send.SendProject.next(project)
     
    this.showComponent(project)
    this.send.SendProject.subscribe((project: any) => {
     console.log("  recive data ")
    });
   
 }

  closeModal(event: any): void {
    const modal = event.target.closest('.modal');
    if (modal) {
      modal.style.display = 'none';
      this.editor.editor_mode = 'edit';
    }
  }
  navActionHandler(event:any){
    //this.sidenav.close()
  
  console.log(' navActionHandler ',event.data)
  }  

    closemodal(e:any) {
     e.target.closest(".drawflow-node").style.zIndex = "2";
     e.target.parentElement.parentElement.style.display  ="none";
     //document.getElementById("modalfix").style.display = "none";
     this.editor.precanvas.style.transform = this.transform;
       this.editor.precanvas.style.left = '0px';
       this.editor.precanvas.style.top = '0px';
      this.editor.editor_mode = "edit";
   }

     changeModule(event:any) {
      var all = document.querySelectorAll(".menu ul li");
        for (var i = 0; i < all.length; i++) {
          all[i].classList.remove('selected');
        }
      event.target.classList.add('selected');
    }
    CheckValidation() {
      // Access all nodes in the 'Home' flow
      const nodes = this.editor.drawflow.drawflow.Home.data;
    
      // Array to store IDs of unlinked nodes
      const unlinkedNodes = [];
    
      // Iterate over all nodes
      for (const nodeId in nodes) {
        const node = nodes[nodeId];
    
        // Check if the node has input or output connections
        const hasInputs = Object.keys(node.inputs).some(inputKey => node.inputs[inputKey].connections.length > 0);
        const hasOutputs = Object.keys(node.outputs).some(outputKey => node.outputs[outputKey].connections.length > 0);
    
        // If neither inputs nor outputs exist, mark the node as unlinked
        if (!hasInputs && !hasOutputs) {
          unlinkedNodes.push(nodeId);
        }
      }
    
      // If there are unlinked nodes, return false and log them
      if (unlinkedNodes.length > 0) {
        alert("Unlinked nodes found:"+ unlinkedNodes);
        return true; // Validation failed
      }
      console.log(" CheckValidation ",JSON.stringify(this.checkNodeConfiguration()))
      // All nodes are linked
      return false; // Validation passed
    }

     checkNodeConfiguration() {
      let validationResults:any = [];
      const nodes = this.editor.drawflow.drawflow.Home.data;
    
  
      Object.values(nodes).forEach((node:any) => {
          let isWellConfigured = true;
          //console.log("Check ",JSON.stringify(node.data))
          // Check if the form field exists
          if (node.data.form) {
              for (let key in node.data.form) {
                  let fieldValue = node.data.form[key].value;
              
                  // If any form field value is null, undefined, or empty, mark as not well configured
                  if (fieldValue === null || fieldValue === undefined || fieldValue === "") {
                     isWellConfigured = false;
                      break;
                  }
              }
          } //else {
            //  isWellConfigured = false; // If no form exists, the node is not well configured
          //}
  
          validationResults.push({
              id: node.id,
              name: node.name,
              isWellConfigured: isWellConfigured,
          });
      });
  
      const notWellConfiguredNodes = validationResults.filter((node:any) => !node.isWellConfigured);

  console.log("Not Well Configured Nodes", notWellConfiguredNodes);
  return notWellConfiguredNodes;
  }
  
  
     
    
    transformEditorToShipBoard(){
       if (this.editor.drawflow.drawflow.Home.data === undefined) return []
      const result = Object.values(this.editor.drawflow.drawflow.Home.data).map((item : any) => item.data);
  
       return result
      }
      getLastDigits(input: string): string | '' {
        const match = input.match(/\d+$/); // Matches one or more digits at the end of the string
        return match ? match[0] : '';    // Returns the matched digits or null if no match
      }
      monotoringFlow00(filePath:string) {
        const body:any = { method: 'factoriel','filePath':filePath, "number":10 };
        console.log(" monotoringFlow post ",JSON.stringify(body))
        // Step 1: Send POST request to initiate computation
        this.http.post('http://localhost:5000/MonotoringFlux', body).subscribe(() => {
            // Step 2: Listen for progress updates via SSE
            const eventSource = new EventSource('http://localhost:5000/MonotoringFlux');
      
            eventSource.onmessage = (event) => {
                var  data0 = JSON.parse(event.data);
                console.log(typeof(data0)," data key  ",Object.keys(data0), " data ",data0)
              
                const data = data0['result'];
                //this.progress = data.progress;
                console.log(typeof(data)," data ",data)
                this.zone.run(() => {
                  //this.progress = data0.noeud;
                  let noeud :string=data0.noeud ||'';
                  let result = data0.status //|| data.final_result;
                  if ( noeud.length >0 )  this.selectNode(this.getLastDigits(noeud))
                  console.log("progress ",this.progress ," resultat ",result)
                  
                  this.send.SendMonotoring.next({'progress':result});
          
            });
      
              if (data0.status === "complete") {
                  eventSource.close();
              }
      
            };
      
            eventSource.onerror = (error) => {
                console.error('SSE Error:', error);
                eventSource.close();
            };
        });
      }

      monotoringFlow(filePath: string) {

        const body: any = { method: 'factoriel', 'filePath': filePath, "number": 10 };
        console.log("monotoringFlow post:", JSON.stringify(body));
    
        // Step 1: Send POST request to initiate computation
        this.http.post('http://localhost:5000/MonotoringFlux', body).subscribe({
            next: (response) => {
                console.log("POST response received:", response);
    
                // Step 2: Start listening for progress updates via SSE after POST response
                const eventSource = new EventSource('http://localhost:5000/MonotoringFlux');
    
                eventSource.onmessage = (event) => {
                    const data0 = JSON.parse(event.data);
                    console.log(typeof (data0), "data key:", Object.keys(data0), "data:", data0);
    
                    const data = data0['result'];
                    console.log(typeof (data), "data:", data);
    
                    this.zone.run(() => {
                        let noeud: string = data0.noeud || '';
                        let result = data0.status;
    
                        if (noeud.length > 0) {
                            this.selectNode(this.getLastDigits(noeud));
                        }
    
                        console.log("progress:", this.progress, "resultat:", result);
                        this.send.SendMonotoring.next({ 'progress': data0.status });
                    });
    
                    if (data0.status === "complete") {
                        console.log("Computation complete. Closing SSE.");
                        eventSource.close();
                    }
                };
    
                eventSource.onerror = (error) => {
                    console.error("SSE Error:", error);
                    eventSource.close();
                };
            },
            error: (err) => {
                console.error("POST request error:", err);
            }
        });
    }
    

    onPlateformChange(event:any){ 
      console.log(' onPlateformChange ',event.value)   
      //this.projectConf['langage']=event.value
      this.updateModulePanel('python')
    }
    updateModulePanel(plateformForm:string){
  
     // console.log(' updateModulePanel ', this.projectConf['langage'])
      this.moduleSending = this.traitModule.filter((elem) => elem.type == 'sending'  ); // filter output modules
  
      //if ( this.projectConf['langage'] == 'SQL' ) {
       
      if ( plateformForm == 'SQL' ) {
        this.moduleInput = this.traitModule.filter((elem) => elem.type == 'input' && elem.name.toUpperCase().includes('IMPALA')); // filter input modules
        this.moduletreat = this.traitModule.filter((elem) => elem.type == 'treat' && elem.name.toUpperCase().includes('IMPALA') ); // filter treat modules
        this.moduleDebug = this.traitModule.filter((elem) => elem.type == 'debug' && elem.name.toUpperCase().includes('IMPALA') ); // filter treat modules
        this.moduleOutput = this.traitModule.filter((elem) => elem.type == 'output' && elem.name.toUpperCase().includes('IMPALA') ); // filter output modules
  
        this.moduleSpark = this.traitModule.filter((elem) => elem.type == 'spark' && elem.name.toUpperCase().includes('IMPALA') ); // filter spark modules
        this.moduleMachine = this.traitModule.filter((elem) => elem.type == 'machine' && elem.name.toUpperCase().includes('IMPALA') ); // filter machine learning modules
  
      }else {
  
        this.moduleInput = this.traitModule.filter((elem) => elem.type == 'input' && !elem.name.toUpperCase().includes('IMPALA')); // filter input modules
        this.moduletreat = this.traitModule.filter((elem) => elem.type == 'treat' && !elem.name.toUpperCase().includes('IMPALA') ); // filter treat modules
        this.moduleDebug = this.traitModule.filter((elem) => elem.type == 'debug' && !elem.name.toUpperCase().includes('IMPALA') ); // filter treat modules
        this.moduleOutput = this.traitModule.filter((elem) => elem.type == 'output' && !elem.name.toUpperCase().includes('IMPALA') ); // filter output modules
  
        this.moduleSpark = this.traitModule.filter((elem) => elem.type == 'spark' && !elem.name.toUpperCase().includes('IMPALA') ); // filter spark modules
        this.moduleMachine = this.traitModule.filter((elem) => elem.type == 'machine' && !elem.name.toUpperCase().includes('IMPALA') ); // filter machine learning modules
  
  console.log(' this.moduleOutput ',JSON.stringify(this.moduleOutput))
      }
  
    //  console.log(this.projectConf['langage'],'onPlateformChange ', this.plateformForm.get('plateform')?.value)
    }
  

}
