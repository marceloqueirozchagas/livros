import { Component, OnInit, OnDestroy } from '@angular/core';
import { livroModel } from '../services/livro.model';
import { LivroService } from '../services/livro.service';
import { Subscription } from 'rxjs';
import { LoadingController, AlertController, ModalController } from '@ionic/angular';
import { registerLocaleData } from '@angular/common';
import pt from '@angular/common/locales/pt';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { DetalhesComponent } from './detalhes/detalhes.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-livros',
  templateUrl: './livros.page.html',
  styleUrls: ['./livros.page.scss'],
})
export class LivrosPage implements OnInit, OnDestroy {
  livros: livroModel[];
  livrosFilter: livroModel[];
  ano: number;
  autor: string;
  tituloPagina: string;
  private _dadosSub = new Subscription();
  private _excluirSub = new Subscription();

  constructor(
    private livroSvc: LivroService,
    private loadinCtrl: LoadingController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(obj => {
      this.ano = +obj.get('ano');
      this.autor = obj.get('autor');

      if (this.ano > 0)
        this.tituloPagina = `Livros de ${this.ano}`
      else if (this.autor != '0')
        this.tituloPagina = `Livros de ${this.autor}`
      else
        this.tituloPagina = "Livros Geral"

      this.obterLivros();
    });

    registerLocaleData(pt);
  }

  obterLivros() {
    this.loadinCtrl.create({ message: "Carregando" }).then(loadEl => {
      loadEl.present();
      this._dadosSub = this.livroSvc.obterLivros(this.ano, this.autor).subscribe(response => {
        this.livros = response;
        this.livrosFilter = this.livros;
        loadEl.dismiss();
      })
    });

    registerLocaleData(pt);
  }

  pesquisar(evt) {
    const pesquisa: string = evt.detail.value.toLowerCase();
    if (pesquisa.length > 0) {
      this.livrosFilter = this.livros.filter(item => {
        return ((item.titulo.toLowerCase().indexOf(pesquisa) > -1)
          || item.autor.toLowerCase().indexOf(pesquisa) > -1);
      });
    }
    else {
      this.livrosFilter = [...this.livros];
    }
  }

  excluir(item) {
    this.alertCtrl.create(
      {
        message: "Deseja realmente excluir este livro?",
        buttons: [
          {
            text: "Cancelar",
            role: "cancel"
          },
          {
            text: "Confirmar",
            handler: () => {
              this.loadinCtrl.create({ message: "Carregando" }).then(loadEl => {
                loadEl.present();
                this._excluirSub = this.livroSvc.excluirLivro(item.id).subscribe(() => {
                  loadEl.dismiss();
                })
              });
            }
          }
        ]
      }
    )
  }

  detalhes(livro) {
    this.livroSvc.detalhesLivro(livro).subscribe((respData: any) => {
      if (respData) {
        this.modalCtrl.create({
          component: DetalhesComponent,
          componentProps: [
            { dados: respData }
          ]
        }).then(modalEl => {
          modalEl.present();
        })
      }
    }, (error) => {
      console.log(error)
    })
  }

  ngOnDestroy() {
    if (this._dadosSub)
      this._dadosSub.unsubscribe();

    if (this._excluirSub)
      this._excluirSub.unsubscribe();
  }
}
