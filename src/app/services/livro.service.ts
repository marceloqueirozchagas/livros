import { Injectable } from '@angular/core';
import { livroModel } from './livro.model';
import { HttpClient } from '@angular/common/http';
import { dadosModel } from './dados.model';
import { BehaviorSubject, of } from 'rxjs';
import { map, take, switchMap, tap } from 'rxjs/operators';
import { DetalhesModel } from './detalhes.model';
import { fireBaseUrl } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class LivroService {
  private _colecaoLivros = new BehaviorSubject<livroModel[]>([]);

  get colecaoLivros() {
    return this._colecaoLivros.asObservable();
  }

  constructor(
    private http: HttpClient) {
    http.get<{ [key: string]: livroModel }>(fireBaseUrl)
      .subscribe((resData) => {
        let livros: livroModel[] = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            livros.push(
              new livroModel(
                key,
                resData[key].ano,
                resData[key].titulo,
                resData[key].autor,
                resData[key].volume,
                resData[key].paginas,
                resData[key].isbn,
              )
            );
          }
        }

        this._colecaoLivros.next(livros);
      })
  }

  obterDados() {
    return this.colecaoLivros
      .pipe(take(1),
        map((livros: livroModel[]) => {
          if (livros.length > 0) {
            const totalLivros = livros.length;
            const totalAnos = Array.from(new Set(livros.map(x => { return x.ano }))).length;
            const totalAutores = Array.from(new Set(livros.map(x => { return x.autor }))).length;
            const totalPaginas = livros.map(x => { return x.paginas }).reduce((accumulator, currentValue) => { return accumulator + currentValue })
            return new dadosModel(totalLivros, totalAutores, totalPaginas, totalAnos);
          }
          else
            return new dadosModel(0, 0, 0, 0);
        }));
  }

  obterAnos() {
    return this.colecaoLivros
      .pipe(take(1),
        map((livros: livroModel[]) => {
          let listaRetorno = [];
          if (livros.length > 0) {
            let anosDistinct = Array.from(new Set(livros.map(x => x.ano)));
            anosDistinct.forEach(ano => {
              let quantidade = livros.filter(x => x.ano === ano).length;
              const totalAutores = Array.from(new Set(livros.filter(x => x.ano === ano).map(x => { return x.autor }))).length;
              const totalPaginas = livros.filter(x => x.ano === ano).map(x => { return x.paginas }).reduce((accumulator, currentValue) => { return accumulator + currentValue })
              listaRetorno.push(
                {
                  ano: ano,
                  quantidade: quantidade,
                  totalAutores: totalAutores,
                  totalPaginas: totalPaginas
                })
            });
          }
          return listaRetorno;
        }));
  }

  obterAutores() {
    return this.colecaoLivros
      .pipe(take(1),
        map((livros: livroModel[]) => {
          let listaRetorno = [];
          if (livros.length > 0) {
            let autoresDistinct = Array.from(new Set(livros.map(x => x.autor)));
            autoresDistinct.forEach(autor => {
              let quantidade = livros.filter(x => x.autor === autor).length;
              const totalPaginas = livros.filter(x => x.autor === autor).map(x => { return x.paginas }).reduce((accumulator, currentValue) => { return accumulator + currentValue })
              listaRetorno.push(
                {
                  autor: autor,
                  quantidade: quantidade,
                  totalPaginas
                })
            });
          }
          return listaRetorno;
        }));
  }

  obterLivros(ano: number, autor: string) {
    return this.colecaoLivros
      .pipe(take(1),
        map((livros: livroModel[]) => {
          let listaRetorno = [];
          if (livros.length > 0) {
            if (ano > 0)
              listaRetorno = livros.filter(x => { return x.ano === ano });
            else if (autor != '0')
              listaRetorno = livros.filter(x => { return x.autor === autor });
            else
              listaRetorno = livros;
          }
          return listaRetorno;
        }));
  }

  obterTodosLivros() {
    return this.colecaoLivros;
  }

  obterLivrosPorAno(ano: number) {
    return this.colecaoLivros
      .pipe(take(1),
        map((livros: livroModel[]) => {
          let listaRetorno = [];
          if (livros.length > 0) {
            listaRetorno = livros.filter(x => { return x.ano === ano });
          }
          return listaRetorno;
        }));
  }

  obterLivrosPorAutor(autor: string) {
    return this.colecaoLivros
      .pipe(take(1),
        map((livros: livroModel[]) => {
          let listaRetorno = [];
          if (livros.length > 0) {
            listaRetorno = livros.filter(x => { return x.autor === autor });
          }
          return listaRetorno;
        }));
  }

  incluirLivro(novoLivro: livroModel) {
    let generatedId: string;
    return this.http
      .post<{ name: string }>(
        'https://app-livros.firebaseio.com/livros.json',
        {
          ...novoLivro,
          id: null
        }
      )
      .pipe(
        switchMap(resData => {
          generatedId = resData.name;
          return this.colecaoLivros;
        }),
        take(1),
        tap(livros => {
          novoLivro.id = generatedId;
          this._colecaoLivros.next(livros.concat(novoLivro));
        })
      );
  }

  obterLivro(id: string) {
    return this.http
      .get<livroModel>(
        `https://app-livros.firebaseio.com/livros/${id}.json`
      )
      .pipe(
        map(livro => {
          return new livroModel(
            id,
            livro.ano,
            livro.titulo,
            livro.autor,
            livro.volume,
            livro.paginas,
            livro.isbn
          );
        })
      );
  }

  editarLivro(livro: livroModel) {
    let livrosAtualizados: livroModel[];
    return this.colecaoLivros.pipe(
      take(1),
      switchMap(livros => {
        if (!livros || livros.length <= 0) {
          return this.obterTodosLivros();
        } else {
          return of(livros);
        }
      }),
      switchMap(livros => {
        const livroAtualizadoIndex = livros.findIndex(pl => pl.id === livro.id);
        livrosAtualizados = [...livros];
        livrosAtualizados[livroAtualizadoIndex] = new livroModel(
          livro.id,
          livro.ano,
          livro.titulo,
          livro.autor,
          livro.volume,
          livro.paginas,
          livro.isbn
        );
        return this.http.put(
          `https://app-livros.firebaseio.com/livros/${livro.id}.json`,
          { ...livrosAtualizados[livroAtualizadoIndex], id: null }
        );
      }),
      tap(() => {
        this._colecaoLivros.next(livrosAtualizados);
      })
    );
  }

  excluirLivro(id: string) {
    return this.http
      .delete(
        `https://app-livros.firebaseio.com/livros/${id}.json`
      )
      .pipe(
        switchMap(() => {
          return this.colecaoLivros;
        }),
        take(1),
        tap(livros => {
          this._colecaoLivros.next(livros.filter(b => b.id !== id));
        })
      );
  }

  detalhesLivro(livro) {
    return this.http.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${livro.isbn}`)
      .pipe(take(1),
        map((respData: any) => {
          if (respData.totalItems > 0) {
            const livro = respData.items[0].volumeInfo
            return new DetalhesModel(
              livro.title,
              livro.publishedDate,
              livro.publisher,
              livro.description,
              livro.imageLinks ? livro.imageLinks.thumbnail : "http://www.biotecdermo.com.br/wp-content/uploads/2016/10/sem-imagem-2.jpg"
            )
          }
          else
            return false
        }));
  }
}
