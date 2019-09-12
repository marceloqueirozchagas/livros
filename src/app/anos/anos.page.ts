import { Component, OnInit, OnDestroy } from '@angular/core';
import { LivroService } from '../services/livro.service';
import { LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import pt from '@angular/common/locales/pt';

@Component({
  selector: 'app-anos',
  templateUrl: 'anos.page.html',
  styleUrls: ['anos.page.scss']
})
export class AnosPage implements OnInit, OnDestroy {
  public anos: any[] = [];
  private _dadosSub = new Subscription();

  constructor(private livroSvc: LivroService, private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.loadingCtrl.create({ message: "Carregando" }).then(loadEl => {
      loadEl.present();
      this._dadosSub = this.livroSvc.obterAnos().subscribe(response => {
        this.anos = response;
        loadEl.dismiss();
      });
    });

    registerLocaleData( pt );
  }

  ngOnDestroy() {
    if (this._dadosSub)
      this._dadosSub.unsubscribe();
  }
}
