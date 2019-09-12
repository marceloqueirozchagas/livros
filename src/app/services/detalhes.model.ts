export class DetalhesModel {
    constructor(
        public titulo: string,
        public dataPublicacao: Date,
        public editora: string,
        public descricao: string,
        public imagem: string
    ) { }
}