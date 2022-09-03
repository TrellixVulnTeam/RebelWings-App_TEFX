import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ServiceGeneralService } from 'src/app/core/services/service-general/service-general.service';
import { LoaderComponent } from 'src/app/pages/dialog-general/loader/loader.component';
import { DialogNotificationComponent } from 'src/app/pages/nav/dialog-notification/dialog-notification.component';
import { ModalController, PopoverController } from '@ionic/angular';
import { LogoutComponent } from 'src/app/pages/popover/logout/logout.component';
import { AlertController } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { interval } from 'rxjs';

@Component({
  selector: 'app-centro-control-matutino',
  templateUrl: './centro-control-matutino.component.html',
  styleUrls: ['./centro-control-matutino.component.scss'],
})
export class CentroControlMatutinoComponent implements OnInit {
  public matutino = 1;
  public user;
  public data: any[] = [];
  public dataNotification: any = [];
  // nombre de sucursal
  public today = new Date();
  public branchId;
  // public nameBranch = '';
  public dataBranch: any[] = [];
  public valueVolado;
  public time;

  // variable menu seleccionable
  public task;
  public cant;
  public completada;
  public contador = null;

  public barProgressTask: number;
  public barProgressTask1: number;
  public color: string;
  constructor(
    public router: Router,public routerActive: ActivatedRoute,
    public service: ServiceGeneralService,
    public load: LoaderComponent,
    public popoverCtrl: PopoverController,
    // public alertController: AlertController,
    public modalController: ModalController,
    public alertController: AlertController,
    public datepipe: DatePipe


  ) { }

  ionViewWillEnter() {

    console.log('viewwillenter');
    //this.user = JSON.parse(localStorage.getItem('userData'));
    //console.log('user', this.user);
    // obtener el nombre de sucursal
    //this.branchId = this.user.branchId;
    //this.task = this.routerActive.snapshot.paramMap.get(`idTarea`);
    // this.getBranch();
    //this.notificationVoladoEfectivo();
    this.getDataControl(this.task);

 



  }
  ngOnInit() {

    this.user = JSON.parse(localStorage.getItem('userData'));
    this.task = this.routerActive.snapshot.paramMap.get(`idTarea`);
    this.branchId = this.user.branchId;
    console.log('user', this.user);
    //this.getNotification();
    //this.notificationVoladoEfectivo();
    //this.getDataControl(this.task);
    this.startTimer();
   
  }
  getDataControl(task) {
    this.load.presentLoading('Cargando..');
    this.service
      .serviceGeneralGet(`ControlCenter/${this.user.branchId}/${this.matutino}/${task}/Manager`)
      .subscribe((resp) => {
        if (resp.success) {
          this.data = resp.result.controlCenters;
          this.barProgressTask = resp.result.progress;
          this.barProgressTask1 = resp.result.progress;
          if (this.barProgressTask === 0){
            this.color = 'danger';
          }
          else if (this.barProgressTask === 100){
            this.color = 'success';
          }
          else{
            this.color = 'warning';
          }
          console.log('control matutino', resp.result);

          //SE ASIGNA EL VALOR DE LA TAREA DE VOLADO DE EFECTIVO
          this.data.filter(data => data.name === "Volado de efectivo").map(data => {this.completada = data.isComplete;});
          console.log('control volado', this.completada);
          this.notificationVoladoEfectivo();
         
        }
        console.log('cant', this.cant);
        
      });
  }

  //FUNCIONES DEL TIMER DE VOLADO DE EFECTIVO
  startTimer() {
    this.stopTimer();
    this.contador = setInterval((n) => { 
      this.notificationVoladoEfectivo();
      console.log('muestra timer'); }, 20000);
  }
  
  stopTimer() {
    
      clearInterval(this.contador);
    
  }


  // async notificationAlarm(){
  //   const timeAlarmaIni = '13:00:00';
  //   const timeAlarmaFin = '12:00:00';

  //   const time = `${this.today.getHours()}:${this.today.getMinutes()}:00`;
  //   console.log('time', time);
  //   if( time >= timeAlarmaIni || time <= timeAlarmaFin ){

  //     const alert = await this.alertController.create({
  //       cssClass: 'my-custom-class',
  //       header: 'Alerta',
  //       subHeader: 'Subtitle',
  //       message: 'Recuerda activar la Alarma, oprime ok para no volver a ver este mensaje',
  //       buttons: ['OK']
  //     });
  //     await alert.present();
  //     const { role } = await alert.onDidDismiss();
  //     console.log('onDidDismiss resolved with role', role);
  //   }

  // }
  return() {
    console.log('return');
    this.router.navigateByUrl('supervisor');
    // window.history.back();
  }
  // get  name sucursal
  // getBranch() {
  //   let branchIdNumber = 0;
  //   branchIdNumber = Number(this.branchId);
  //   console.log('branchIdNumber', branchIdNumber);
  //   this.service.serviceGeneralGet('StockChicken/Admin/All-Branch').subscribe(resp => {
  //     if (resp.success) {
  //       this.dataBranch = resp.result;
  //       console.log('get branch', this.dataBranch);
  //       this.dataBranch.forEach(element => {
  //         if (element.branchId === branchIdNumber) {
  //           this.nameBranch = element.branchName;
  //           this.nameBranch = this.nameBranch.toUpperCase();
  //           console.log('nombre', this.nameBranch);
  //         }
  //       });
  //     }
  //   });
  // }
  async logout(e: any) {
    const popover = await this.popoverCtrl.create({
      component: LogoutComponent,
      cssClass: 'my-custom-class',
      event: e,
      translucent: true,
      mode: 'ios', //sirve para tomar el diseño de ios
      backdropDismiss: true,
    });
    return await popover.present();

  }

  async notificationVoladoEfectivo() {
    this.valueVolado = [];
    console.log('date', this.today);
    let timeTemp = '';
    const hour = this.today.getHours();
    const minute = this.today.getMinutes();
    let hourString = hour.toString();
    let minuteString = minute.toString();
    const date = this.datepipe.transform(this.today, 'yyyy-MM-dd');
    if (hourString.length < 2) {
      hourString = `0${hourString}`;
    }
    if (minuteString.length < 2) {
      minuteString = `0${minuteString}`;
    }
    timeTemp = `${hourString}:${minuteString}:00`;
    this.time = `${date}T${timeTemp}`;
    console.log('format date', this.time);
    this.service.serviceGeneralGet(`CashRegisterShortage/GetCash?id_sucursal=${this.user.branch}&dataBase=${this.user.dataBase}`).subscribe(resp => {
      if (resp.success) {
        
        // si entra success el volado es mayor a 3000
        this.valueVolado = resp;
        this.valueVolado.message = Number(this.valueVolado.message);
        this.valueVolado.time = this.time;
        this.valueVolado.message = Number(this.valueVolado.message);
        localStorage.setItem('valueVolado', JSON.stringify(this.valueVolado));
        //SE DETINE EL TIMER DE ACTUALIZADO DE VOLADO
        this.stopTimer();
        //this.alertVolado();
        
      }
      else {

        // prueba
        // this.valueVolado = resp;
        // this.valueVolado.message = 3000;
        // this.valueVolado.time = this.time;
        // console.log('valor', this.valueVolado);
        // localStorage.setItem('valueVolado', JSON.stringify(this.valueVolado));
        // this.alertVolado();
        // //
        // this.valueVolado = resp;
        // this.valueVolado.time = this.time;
        this.valueVolado = resp;
        this.valueVolado.message = Number(this.valueVolado.message);
        localStorage.setItem('valueVolado', JSON.stringify(this.valueVolado));
        console.log('Aun no hay 3mil pesos', this.valueVolado);

      }
      
      if(this.valueVolado.message < 3000){
        this.cant = false;
 
        if(this.completada === false){
        this.barProgressTask =0;
        this.barProgressTask = this.barProgressTask1 + 16.66666666666667;
        }

     }
     else{
      if(this.valueVolado.message == undefined){
        this.cant = false;
        if(this.completada === false){
          this.barProgressTask =0;
          this.barProgressTask = this.barProgressTask1 + 16.66666666666667;
          }
       }
       else{
        this.cant = true;
 
        if(this.completada === true){
          this.barProgressTask =0;
          this.barProgressTask = this.barProgressTask1 - 16.66666666666667;
          }
        }
     }

    });
  }
  async alertVolado(){
    if (this.valueVolado.success === true) {
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Realiza el volado de efectivo',
        subHeader: `Por $ ${this.valueVolado.message} MXN`,
        message: 'Se activara un cronómetro para identificar en cuánto tiempo se hizo el volado de efectivo.',
        mode: 'ios', //sirve para tomar el diseño de ios
        buttons: ['OK']
      });
      await alert.present();
      const { role, } = await alert.onDidDismiss();
      console.log('onDidDismiss resolved with role', role);
      //SE INICIA TIMER DE VOLADO DE EFECTIO
      this.startTimer();
    }
  }

  //*****************notification*****************************
  async openNotification() {
  // package = 0 es nuevo registos, si es != 0 es update
  const modal = await this.modalController.create({
    component: DialogNotificationComponent,
    cssClass: 'my-custom-class',
    swipeToClose: true,
    componentProps: {
      id: this.user.branchId, //se envia el id de sucursal
    },
  });
  modal.onDidDismiss().then((data) => {
    console.log(data);
    this.ionViewWillEnter();
  });
  this.modalController.dismiss();
  return await modal.present();
  }

  getNotification() {
    this.service
      .serviceGeneralGet('Transfer/Notifications?id=' + this.user.branchId)
      .subscribe((resp) => {
        if (resp.success) {
          this.dataNotification = resp.result;
          console.log('notificaciones', this.dataNotification);
        }
      });
  }

  showTermina() {
    this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'ADVERTENCIA',
      subHeader: 'TERMINA TURNO',
      message: '¿ESTAS SEGURO DE TERMINAR EL TURNO?',
      mode: 'ios', 
      buttons: [
        {
          text: 'CANCELAR',
          handler: (data: any) => {
            console.log('TERMINAR TURNO CANCELADO');
          }
        },
        {
          text: 'ACEPTAR',
          handler: (data: any) => {
            console.log('TERMINAR TURNO');
            this.showValidaTermina();
          }
        }
      ]
    }).then(res => {
      res.present();
    });
  }
  
  showValidaTermina() {
    this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'IMPORTANTE',
      subHeader: 'TERMINAR TURNO',
      message: 'AL TERMINAR EL TURNO YA NO PODRAS INGRESAR NUEVAMENTE',
      mode: 'ios', 
      buttons: [
        {
          text: 'CANCELAR',
          handler: (data: any) => {
            console.log('TERMINAR TURNO CANCELADO');
          }
        },
        {
          text: 'ACEPTAR',
          handler: (data: any) => {
            console.log('TERMINAR');
            this.terminarTurno();
          }
        }
      ]
    }).then(res => {
      res.present();
    });
  }
  
  validacionAsistencia() {
    this.router.navigateByUrl('supervisor/validacion-assistencia/1');
  }
  validacionGas(id: number) {
    if (id === null) {
      id = 0;
    }
    this.router.navigateByUrl('supervisor/validacion-gas/' + id);
  }
  salonMontado(id: number) {
    if (id === null) {
      id = 0;
    }
    this.router.navigateByUrl('supervisor/salon-montado/' + id);
  }
  banosMatutino(id: number) {
    if (id === null) {
      id = 0;
    }
    this.router.navigateByUrl('supervisor/banos-matutino/' + id);
  }
  stockPollo(id: number) {
    this.router.navigateByUrl('supervisor/expectativa-venta/' + id);
  }
  terminarTurno() {
    this.stopTimer();
    this.router.navigateByUrl('supervisor');
  }
  mesas(id: number) {
    if (id === null) {
      id = 0;
    }
    this.router.navigateByUrl(`supervisor/mesa-espera/1/${id}`);
  }
  remisiones(id) {
    if (id === null) {
      id = 0;
    }
    this.router.navigateByUrl('supervisor/remisiones/1/' + id);
  }
  productoRiesgo(id) {
    console.log('id producto en riesgo', id);
    if (id === null) {
      id = 0;
    }
    this.router.navigateByUrl('supervisor/producto-riesgo/1/' + id);
  }
  transferencias(id) {
  if (id === null) {
    id = 0;
  }
  this.router.navigateByUrl('supervisor/transferencias/1/' + id);
  }
  voladoEfectivo(id) {
  if (id === null) {
    id = 0;
  }
  this.router.navigateByUrl('supervisor/volado-efectivo/1/' + id);
  }


}

