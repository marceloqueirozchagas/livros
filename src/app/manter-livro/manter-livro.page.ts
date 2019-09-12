import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LivroService } from '../services/livro.service';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { livroModel } from '../services/livro.model';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-manter-livro',
  templateUrl: './manter-livro.page.html',
  styleUrls: ['./manter-livro.page.scss'],
})
export class ManterLivroPage implements OnInit, OnDestroy {
  public form: FormGroup;
  private _dadosSub = new Subscription();
  private id: string;

  constructor(
    private livroSvc: LivroService,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private route: ActivatedRoute
  ) {
    this.form = new FormGroup({
      ano: new FormControl(null, Validators.required),
      titulo: new FormControl(null, Validators.required),
      autor: new FormControl(null, Validators.required),
      volume: new FormControl(null),
      paginas: new FormControl(null, Validators.required),
      isbn: new FormControl(null),
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(x => {
      if (x.has('id'))
        this.id = x.get('id');

      this.carregarDadosFormulario();
    });
  }

  carregarDadosFormulario() {
    if (this.id != '0') {
      this.livroSvc.obterLivro(this.id).subscribe(x => {
        this.form = new FormGroup({
          ano: new FormControl(x.ano, Validators.required),
          titulo: new FormControl(x.titulo, Validators.required),
          autor: new FormControl(x.autor, Validators.required),
          volume: new FormControl(x.volume),
          paginas: new FormControl(x.paginas, Validators.required),
          isbn: new FormControl(x.isbn)
        });
      })
    }
  }

  salvar() {
    if (this.form.valid) {
      if (this.id != '0') {
        this.loadingCtrl.create({ message: "Salvando" }).then(loadEl => {
          loadEl.present();
          const novoLivro = new livroModel(
            this.id,
            +this.form.value.ano,
            this.form.value.titulo,
            this.form.value.autor,
            this.form.value.volume,
            +this.form.value.paginas,
            this.form.value.isbn
          );

          this._dadosSub = this.livroSvc.editarLivro(novoLivro).subscribe(() => {
            loadEl.dismiss();
            this.form.reset;
            this.navCtrl.navigateRoot('home');
          });
        });
      } else {
        this.loadingCtrl.create({ message: "Salvando" }).then(loadEl => {
          loadEl.present();
          const novoLivro = new livroModel('',
            +this.form.value.ano,
            this.form.value.titulo,
            this.form.value.autor,
            this.form.value.volume,
            +this.form.value.paginas,
            this.form.value.isbn
          );

          this._dadosSub = this.livroSvc.incluirLivro(novoLivro).subscribe(() => {
            loadEl.dismiss();
            this.form.reset;
            this.navCtrl.navigateRoot('home');
          });
        });
      }
    }
    else {
      this.alertCtrl.create({
        message: "Verifique os campos *Obrigatórios",
        buttons: [
          {
            text: "Ok",
            role: "cancel"
          }
        ]
      }).then(alertEl => {
        alertEl.present();
      })
    }
  }

  ngOnDestroy() {
    if (this._dadosSub)
      this._dadosSub.unsubscribe();
  }
}
