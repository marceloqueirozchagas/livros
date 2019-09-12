import { Component, OnInit, OnDestroy } from '@angular/core';
import { LivroService } from '../services/livro.service';
import { Subscription } from 'rxjs';
import { LoadingController } from '@ionic/angular';
import { registerLocaleData } from '@angular/common';
import pt from '@angular/common/locales/pt';

@Component({
  selector: 'app-autores',
  templateUrl: './autores.page.html',
  styleUrls: ['./autores.page.scss'],
})
export class AutoresPage implements OnInit, OnDestroy {

  public autores: any[] = [];
  private _dadosSub = new Subscription();

  constructor(private livroSvc: LivroService, private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.loadingCtrl.create({ message: "Carregando" }).then(loadEl => {
      loadEl.present();
      this.livroSvc.obterAutores().subscribe(response => {
        this.autores = response;
        loadEl.dismiss();
      })
    })
    registerLocaleData( pt );
  }

  ngOnDestroy() {
    if (this._dadosSub)
      this._dadosSub.unsubscribe();
  }
}
