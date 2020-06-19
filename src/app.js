const express = require("express");

const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

//VARIAVEL QUE GUARDA OS REPOSITORIOS
const repositories = [];

//VARIAVEL QUE GUARDA O ID DOS REPOSITORIOS E SEUS LIKES
const repositoriesLikes = [];

//VALIDA O ID NAS ROTAS EM QUE O UTILIZAM COMO PARAMS
function validateIdRepository(request, response, next){

  const {id} = request.params;

  if(!isUuid(id))
  {
    return response.status(400).send("Invalid id");
  }

  return next();
}

//VALIDA A EXISTENCIA DO REPOSITORIO
function validateRepository(request, response, next)
{
  const {id} = request.params;

  //BUSCA O ÍNDICE DO REPOSITÓRIO CORRESPONDENDO AO ID
  const repositoryIndex = repositories.findIndex(rep => rep.id == id);

  if(repositoryIndex < 0 )
  {
    response.status(400).send("Not found Id repositoy");
  }

  return next();
}

app.use('/repositories/:id', validateIdRepository);
app.use('/repositories/:id', validateRepository);

app.get("/repositories", (request, response) => {
    return response.json(repositories);
});

app.post("/repositories", (request, response) => {

    const {title, url, techs} = request.body;
    const id = uuid();
    const repository = {id, title: title, url: url, techs: techs, likes: 0}

    //SETA O REPOSITORIO 
    repositories.push(repository);

    //REGISTRA O NOVO REPOSITORIO E SEUS LIKES(0 POR PADRÃO) 
    repositoriesLikes.push({id: id, likes: 0});

    return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {

    const {id} = request.params;
    const {title, url, techs} = request.body;

    //BUSCA O ÍNDICE DO REPOSITÓRIO QUE SERÁ ALTERADO
    const repositoryIndex = repositories.findIndex(rep => rep.id == id);

    if(repositoryIndex < 0 )
    {
      response.status(400).send("Not found Id repositoy");
    }

    //PEGA O VALOR DA PROPRIEDADE 'LIKES' DO OBJETO REPOSITORIO
    const {likes} = repositoriesLikes.find(rep => rep.id == id );
    
    //RECONSTROI O REPOSITORIO COM OS VALORES ATUALIZADOS
    const repository = {id, title: title, url: url, techs: techs, likes: likes}

    //SETA O REPOSITORIO ATUALIZADO  
    repositories[repositoryIndex] = repository;

    return response.json(repository);

});

app.delete("/repositories/:id", (request, response) => {

    const {id} = request.params;

    //BUSCA O ÍNDICE DO REPOSITÓRIO QUE SERÁ DELETADO
    const repositoryIndex = repositories.findIndex(rep => rep.id == id);

    repositories.splice(repositoryIndex, 1);

    return response.status(204).send();

});

app.post("/repositories/:id/like", validateIdRepository, validateRepository, (request, response) => {
    const {id} = request.params;

    //BUSCA O ÍNDICE DO REPOSITÓRIO QUE TERÁ A PROPRIEDADE LIKES ALTERADA
    const repositoryIndex = repositories.findIndex(rep => rep.id == id);

    //BUSCA O VALOR DA PROPRIEDADES LIKES DO REPOSITORIO ANTES DA ALTERAÇÃO
    const likes = repositoriesLikes.find(rep => rep.id == id );
    
    //BUSCA O ÍNDICE DO REGISTRO DE LIKES PARA SETAR A ATUALIZAÇÃO NA PROPRIEDADE 'LIKES' DO ID REQUISITADO
    const repositoryLikesIndex = repositoriesLikes.findIndex(rep => rep.id == id);

    //VALOR ATUALIZADO DA PROPRIEDADE 'LIKES'
    const newLikes = likes["likes"] + 1;

    //SETA O NOVO VALOR NO ARRAY DE REGISTROS
    repositoriesLikes[repositoryLikesIndex]["likes"] = newLikes;

    //SETA O NOVO VALOR NO ARRAY DE REPOSITÓRIOS
    repositories[repositoryIndex]["likes"] = newLikes;;

    return response.json(repositories[repositoryIndex]);
});

module.exports = app;
