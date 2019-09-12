import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { DetalhesModel } from 'src/app/services/detalhes.model';

@Component({
  selector: 'app-detalhes',
  templateUrl: './detalhes.component.html',
  styleUrls: ['./detalhes.component.scss'],
})
export class DetalhesComponent implements OnInit {

  livro: DetalhesModel;
  constructor(
    private navParams: NavParams,
    private modalCtrl: ModalController
  ) {
    this.livro = navParams.data[0].dados;
  }

  ngOnInit() { }

  fechar() {
    this.modalCtrl.dismiss();
  }

}
