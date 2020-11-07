import React, {Component} from 'react'
import '../../style.css';
import logo from '../../imagens/logo.png';
import * as signalR from '@aspnet/signalr';
import  { Redirect } from 'react-router-dom'



class Cadastrar extends Component{
    constructor(props){
        super(props);
        this.state ={            
                apelido:'',
                email:'',
                senha:'',
                           
        }

        this.mensagemErro ='' ;
        

        this.onCadastrar = this.onCadastrar.bind(this);
        this.cadastrarUsuarioResponse = this.cadastrarUsuarioResponse.bind(this);      
    }

    
    

    componentDidMount() {
        this.connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:30195/zapwebHub")
         //.withHubProtocol(protocol)
        .build();
         // .fail(err=> console.log(err.toString()));
       
        this.connection.on('CadastrarUsuarioResponse', this.cadastrarUsuarioResponse);
         //connection.on('ReceberPromocao', this.onReceberPromocao);


        this.connection.start({credentials:true})
        .then(function() { 
              console.info('SignalR Connected');
             
        })
        .catch(err => console.error('SignalR Connection Error: ', err));
    }

    cadastrarUsuarioResponse(usuario, mensagem){
       if(usuario==null)
            this.mensagemErro=mensagem;
        else{

            this.props.history.push('/batepapo')
            
            /**
            let state = this.state;
            state.apelido='';
            state.email='';
            state.senha='';
            this.setState(state);
            **/
        }
        
    }


    onCadastrar(ev){
        let state = this.state;
        console.log("state: ",state)
        this.connection.invoke("CadastrarUsuario",state)
        .then(()=>{
            state.apelido='';
            state.email='';
            state.senha='';
            this.setState(state);
           //console.log("state: ",state)
            
        })
        .catch((erro)=>{
            console.log("Erro ao executar CadastrarUsuario "+erro.toString())
        });
        
        ev.preventDefault();    
    }

    render(){
        return(
            
            <div className="container-login">
                <img className="container-login-logo" src={logo}/>
                <h1>ZapWeb</h1>
                <h3>{ this.mensagemErro }</h3>
                <div className="container-form">
                    <input type="text" name="apelido" value={this.state.apelido} placeholder="Apelido" onChange={(ev)=> this.setState({apelido:ev.target.value})} />
                    <br />
                    <input type="text" name="email" value={this.state.email} placeholder="E-mail" onChange={(ev)=> this.setState({email:ev.target.value})} />
                    <br />
                    <input type="text" name="senha" value={this.state.senha} placeholder="Senha" onChange={(ev)=> this.setState({senha:ev.target.value})} />
                    
                    <div className="container-button">
                        <input type="button" value="CADASTRAR" onClick={this.onCadastrar} />
                    </div>
                </div>
                
            </div>
        );
    }
}


export default Cadastrar;