import { Component, OnInit, OnDestroy } from '@angular/core';
import { LivroService } from '../services/livro.service';
import { dadosModel } from '../services/dados.model';
import { SubjectSubscriber } from 'rxjs/internal/Subject';
import { Subscription } from 'rxjs';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit, OnDestroy {
  dados: dadosModel = new dadosModel(0,0,0,0);
  private _dadosSub = new Subscription();

  constructor(private livroSvc: LivroService, private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.loadingCtrl.create({ message: "Carregando" }).then(loadEl => {
      loadEl.present();
      this._dadosSub = this.livroSvc.obterDados().subscribe(response => {
        this.dados = response
        loadEl.dismiss();
      });
    });
  }

  ngOnDestroy() {
    if (!this._dadosSub)
      this._dadosSub.unsubscribe();
  }
}
