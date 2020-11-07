import React, {Component,useState, useEffect } from 'react';
import logo from '../../imagens/logo.png';
import chat from '../../imagens/chat.png';
import '../../style.css';
import * as signalR from '@aspnet/signalr';


class Conversation extends Component{

    constructor(props){
        super(props);
        
       
        
        this.state = {
            usuarioSelecionado:{email:''},
            grupoId:0,
            texto:'',            
            mensagens :[ {texto:'mensagem 1', usuario:'Sid', usuarioId:0,grupoId:0}],
            listaUsuarios : [
                {apelido: '',email:''}
            ]
        }

        //TREstando
     // this.atualizarConnectionId = this.atualizarConnectionId.bind(this);
     this.getListaUsuariosResponse =this.getListaUsuariosResponse.bind(this);
     this.iniciarBatePapo = this.iniciarBatePapo.bind(this);
     //this.loginResponse = this.loginResponse.bind(this);
     this.enviarMensagem = this.enviarMensagem.bind(this);
     this.criarAbrirGrupo = this.criarAbrirGrupo.bind(this);
     this.criarAbrirGrupoResponse = this.criarAbrirGrupoResponse.bind(this);
     this.enviarMensagemResponse = this.enviarMensagemResponse.bind(this);

    }

    onSair =()=>{
      
        let usuario = JSON.parse(localStorage.getItem("Logado"));
        localStorage.removeItem("Logado");
                            
        this.connection.invoke("AtualizarConnectionId",usuario, false); 
        this.props.history.push('/login');               
    }

     
     
   componentDidMount() {
    let usuario = JSON.parse(localStorage.getItem("Logado"));

    if(usuario==null)
        this.props.history.push('/login')

    this.connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:30195/zapwebHub")
     //.withHubProtocol(protocol)
    .build();
     // .fail(err=> console.log(err.toString()));
   
    this.connection.on('GetListaUsuariosResponse', this.getListaUsuariosResponse);
    this.connection.on('CriarGrupoResponse', this.criarGrupoResponse);
    this.connection.on('EnviarMensagemResponse', this.enviarMensagemResponse);
    
    
    this.connection.start({credentials:true})
    .then(function() { 
          console.info('SignalR Connected');
         // 
         
        
    })
    .catch(err => console.error('SignalR Connection Error: ', err));

    setTimeout(this.iniciarBatePapo,100);
   }

   getListaUsuariosResponse(usuarios){

        let usuario = JSON.parse(localStorage.getItem("Logado"));
        var listaUsuarios = new Array();

       
        for(var i=0; i< usuarios.length; i++){
            if(usuario!=null && usuarios[i].id!=usuario.id)
                listaUsuarios.push(usuarios[i])
        }


        this.setState({listaUsuarios : listaUsuarios});
        


        
        console.log("lista:", listaUsuarios);
   }

   iniciarBatePapo=()=>{
    let usuario = JSON.parse(localStorage.getItem("Logado"));

    this.connection.invoke("AtualizarConnectionId",usuario, true);
    this.connection.invoke("GetListaUsuarios");
    
   }

   componentWillUnmount(){
        let usuario = JSON.parse(localStorage.getItem("Logado"));

        if(usuario!=null)
            this.connection.invoke("AtualizarConnectionId",usuario, false);
   }

   enviarMensagem = () =>{
      let usuario = JSON.parse(localStorage.getItem("Logado"));

      let mensagem = {texto: this.state.texto, usuario:'Eu'}; 
      this.setState({texto:'', mensagens:[...this.state.mensagens, mensagem]});
     
      this.connection.invoke("SalvarMensagem",usuario.id, this.state.grupoId);
      //this.setState({mensagens:[...this.state.mensagens, mensagem]})  
   }

   enviarMensagemResponse = (mensagem) =>{
    //let usuario = JSON.parse(localStorage.getItem("Logado"));
        console.log(mensagem)
        this.setState({texto:'', mensagens:[...this.state.mensagens, mensagem]});             
    }

    criarAbrirGrupo(emailClicado){
        let usuario = JSON.parse(localStorage.getItem("Logado"));
        this.connection.invoke("CriarAbrirGrupo",usuario.email, emailClicado);
   }
 
   criarAbrirGrupoResponse=(dadosGrupo, mensagem)=>{
       this.setState({usuarioSelecionado:{apelido:dadosGrupo.apelido},mensagens:dadosGrupo.mensagens,grupoId: dadosGrupo.grupoId})
       console.log(this.state.usuarioSelecionado);
   }

    render(){
        return(
            <>
                <div className="sidenav">
                    <div className="container-batepapo-logo">
                            <img src={logo} />
                            <a className="cursor-hand" onClick={this.onSair} >Sair</a>
                    </div>
                    <div id="users">
                    
                    { this.state.listaUsuarios.map((usuario) =>{
                        return(
                            <div key="usuario.id" name={usuario.email} className="container-user-item" onClick={ (ev)=>{ this.criarAbrirGrupo(ev.target.name); } }>
                                <img src={logo} name={usuario.email} />
                                <div>
                                    <span name={usuario.email} >{usuario.apelido} <span> { usuario.isOnline ? '(Online)' : '(Offline)' } </span> </span>
                                    <span name={usuario.email} className="email">{usuario.email}</span>
                                </div>
                            </div>
                        )
                    })
                    }
                    </div>
                    
                </div>
                
            
                <div className="main">
                <div className="top-conversation-bar">{this.state.usuarioSelecionado.apelido}</div>
                    <div className="container-messages">
                    
                        {
                            this.state.mensagens.map((mensagem) =>{
                                return(
                                    <div className={  mensagem.usuario=='Eu' ?  "message message-right" : "message message-left" }>
                                    <div className="message-head">
                                        <img src={chat} />   
                                        {mensagem.usuario}
                                    </div>
                                    <div className="message-message">
                                       {mensagem.texto} 
                                    </div>
                                    
                                    
                                    </div>

                                );
                            })
                        }
                       
                       
                    </div>
                    
                    <div className="container-button">
                        <input type="text" placeholder="Mensagem" value={this.state.texto}  onChange={(ev)=>{ this.setState({texto:ev.target.value}) }}/>    
                        <button className="btn-send" onClick={this.enviarMensagem}></button>
                    </div>
                    <div><button onClick={this.iniciarBatePapo}>Iniciar</button> </div>
                    
                </div>
            </>
        );
    }
}

export default Conversation;