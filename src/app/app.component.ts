import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxXml2jsonService } from 'ngx-xml2json';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {

  fileIsUploaded: boolean = false

  json: any

  // uploaded file
  file: any
  
  //data exported to the csv
  data:any[] = [

  ]

  columnsToDisplay = [
    "Name",
    "Namespace",
    "IdentifierType",
    "Identifier",
    "Type",
    "Width",
    "Signed",
    "Max string length",
  ];

  Address:any

  constructor(private ngxXml2json: NgxXml2jsonService, private fb: FormBuilder){
    //create form values
    this.Address = fb.group({
      'Namespace':[4],
      'IdentifierType':["s"],
      'Identifier':["|var|3231C"]
    })
  }  

  handleFileInput(evt){
    this.file = evt[0]

    let fileReader = new FileReader();
    fileReader.onloadend = (e) => {
      this.xmlToJson(fileReader.result)
    }
    fileReader.readAsText(this.file);
  }
  
  xmlToJson(xmltext){
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmltext, 'text/xml');
    this.json = this.ngxXml2json.xmlToJson(xml);
    this.setData()
  }

  setData(){
    let attributes = "@attributes"
    this.data = []
    //set the name
    console.log(this.json);
    if (this.json.Symbolconfiguration.NodeList.Node.Node instanceof Array) {
      for (let n = 0; n < this.json.Symbolconfiguration.NodeList.Node.Node.length; n++) {
        for (let i = 0; i < this.json.Symbolconfiguration.NodeList.Node.Node[n].Node.length; i++) {
          this.data[i] = {Name: this.json.Symbolconfiguration.NodeList.Node.Node[n].Node[i][attributes].name}
          this.data[i].Address = this.json.Symbolconfiguration.NodeList.Node[attributes].name + "." + this.json.Symbolconfiguration.NodeList.Node.Node[n][attributes].name + "." +this.json.Symbolconfiguration.NodeList.Node.Node[n].Node[i][attributes].name
            for (let m = 0; m < this.json.Symbolconfiguration.TypeList.TypeSimple.length; m++) {
              if (this.json.Symbolconfiguration.NodeList.Node.Node[n].Node[i][attributes].type == this.json.Symbolconfiguration.TypeList.TypeSimple[m][attributes].name) {
                var iecname = this.json.Symbolconfiguration.TypeList.TypeSimple[m][attributes].iecname
              }
            }
          this.lenzeToIxon(i, iecname)
        }
      }
    }else{
      for (let i = 0; i < this.json.Symbolconfiguration.NodeList.Node.Node.Node.length; i++) {
        this.data[i] = {Name: this.json.Symbolconfiguration.NodeList.Node.Node.Node[i][attributes].name}
        this.data[i].Address = this.json.Symbolconfiguration.NodeList.Node[attributes].name + "." + this.json.Symbolconfiguration.NodeList.Node.Node[attributes].name + "." +this.json.Symbolconfiguration.NodeList.Node.Node.Node[i][attributes].name
          for (let m = 0; m < this.json.Symbolconfiguration.TypeList.TypeSimple.length; m++) {
            if (this.json.Symbolconfiguration.NodeList.Node.Node.Node[i][attributes].type == this.json.Symbolconfiguration.TypeList.TypeSimple[m][attributes].name) {
              var iecname = this.json.Symbolconfiguration.TypeList.TypeSimple[m][attributes].iecname
            }
          }
        this.lenzeToIxon(i, iecname)
      }
    }
    this.fileIsUploaded = true
  }
  // We need the iecname so we search for it by name
  lenzeToIxon(i, iecname){
    switch (iecname) {
      case "BOOL":
      this.data[i].Type = "bool"
      this.data[i].Width = ""
        break;
      case "BYTE":
      this.data[i].Type = "int"
      this.data[i].Width = 8
      this.data[i].Signed = "TRUE"
        break;
      case "DINT":
      this.data[i].Type = "int"
      this.data[i].Width = 32
      this.data[i].Signed = "TRUE"
        break;
      case "INT":
      this.data[i].Type = "int"
      this.data[i].Width = 16
      this.data[i].Signed = "TRUE"
        break;
      case "LREAL":
      this.data[i].Type = "float"
      this.data[i].Width = 64
        break;
      case "REAL":
      this.data[i].Type = "float"
      this.data[i].Width = 32
        break;
      case "STRING(60)":
      this.data[i].Type = "str"
      this.data[i].Width = ""
      this.data[i].Signed = ""
      this.data[i].MaxStringLength = 60
        break;
      case "TIME":
      // wordt niet ondersteund dus ook niet geexporteerd
      this.data[i].Type = "Not supported"
        break;
      case "UINT":
      this.data[i].Type = "int"
      this.data[i].Width = 16
      this.data[i].Signed = "FALSE"
        break;
      case "WORD":
      this.data[i].Type = "int"
      this.data[i].Width = 16
      this.data[i].Signed = "FALSE"
        break;
      case "OperationMode":
      this.data[i].Type = "int"
      this.data[i].Width = 16
      this.data[i].Signed = "TRUE"
        break;
      default:
      window.alert("Error: Unknown variable found")
        break;
    }
  }

  // Csv file options
  options = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalseparator: '.',
    showLabels: false,
    headers: [
      "Name",
      "Address",
      "Type",
      "Width",
      "Signed",
      "Max string length",
    ],
    showTitle: false,
    useBom: false,
    nullToEmptyString: true
  };
  Download(){
    // create the address before the download
    let CSVfile = this.data.map(a => Object.assign({}, a))
    console.log(CSVfile);
    
    let attributes = "@attributes"
    if (this.json.Symbolconfiguration.NodeList.Node.Node instanceof Array) {
      for (let n = 0; n < this.json.Symbolconfiguration.NodeList.Node.Node.length; n++) {
        for (let i = 0; i < this.json.Symbolconfiguration.NodeList.Node.Node[n].Node.length; i++) {
          CSVfile[i].Unit = ""
          CSVfile[i].Address = `ns=${this.Address.value.Namespace};${this.Address.value.IdentifierType}=${this.Address.value.Identifier}.${this.json.Symbolconfiguration.NodeList.Node[attributes].name}.${this.json.Symbolconfiguration.NodeList.Node.Node[n][attributes].name}.${this.json.Symbolconfiguration.NodeList.Node.Node[n].Node[i][attributes].name}`
        }
      }
    }else{
      for (let i = 0; i < this.json.Symbolconfiguration.NodeList.Node.Node.Node.length; i++) {
        CSVfile[i].Unit = ""
        CSVfile[i].Address = `ns=${this.Address.value.Namespace};${this.Address.value.IdentifierType}=${this.Address.value.Identifier}.${this.json.Symbolconfiguration.NodeList.Node[attributes].name}.${this.json.Symbolconfiguration.NodeList.Node.Node[attributes].name}.${this.json.Symbolconfiguration.NodeList.Node.Node.Node[i][attributes].name}`
      }
    }
    for (let i = 0; i < CSVfile.length; i++) {
      if (CSVfile[i].Type == "Not supported") {
        CSVfile.splice(i,1)
      }
    }
    new Angular5Csv(CSVfile, "IXON datasource", this.options)
  }
}
